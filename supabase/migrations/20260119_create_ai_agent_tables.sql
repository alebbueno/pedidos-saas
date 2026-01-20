-- AI Agent Configuration Table
-- Stores restaurant-specific agent settings and behavior
CREATE TABLE ai_agent_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    -- Basic Information
    agent_name TEXT NOT NULL DEFAULT 'Atendente Virtual',
    agent_function TEXT NOT NULL DEFAULT 'Atender clientes, tirar dúvidas do cardápio e registrar pedidos.',
    
    -- Tone of Voice
    tone_of_voice TEXT NOT NULL DEFAULT 'friendly' CHECK (tone_of_voice IN ('formal', 'friendly', 'casual', 'professional')),
    tone_notes TEXT, -- Optional custom tone instructions
    
    -- Restaurant Context (for agent knowledge)
    restaurant_type TEXT, -- pizzaria, hamburgueria, açaí, etc
    opening_hours TEXT,
    delivery_fee DECIMAL(10, 2),
    avg_delivery_time_minutes INTEGER DEFAULT 40,
    accepts_pickup BOOLEAN DEFAULT TRUE,
    
    -- Custom Instructions
    additional_instructions TEXT, -- Free-form custom rules
    
    -- System
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Conversations Table
-- Tracks individual WhatsApp conversations with customers
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    
    -- Conversation Metadata
    phone_number TEXT NOT NULL, -- Customer's WhatsApp number
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    
    -- Context
    current_order_draft JSONB, -- Temporary order being built
    context_data JSONB DEFAULT '{}'::JSONB, -- Additional context (preferences, etc)
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Conversation Messages Table
-- Stores individual messages in conversations
CREATE TABLE ai_conversation_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE NOT NULL,
    
    -- Message Content
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB, -- Function calls, tokens used, etc
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_ai_agent_configs_restaurant ON ai_agent_configs(restaurant_id);
CREATE INDEX idx_ai_conversations_restaurant ON ai_conversations(restaurant_id);
CREATE INDEX idx_ai_conversations_customer ON ai_conversations(customer_id);
CREATE INDEX idx_ai_conversations_phone ON ai_conversations(phone_number);
CREATE INDEX idx_ai_conversations_status ON ai_conversations(status);
CREATE INDEX idx_ai_conversation_messages_conversation ON ai_conversation_messages(conversation_id);
CREATE INDEX idx_ai_conversation_messages_created ON ai_conversation_messages(created_at);

-- RLS Policies
ALTER TABLE ai_agent_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversation_messages ENABLE ROW LEVEL SECURITY;

-- Agent Config Policies (Restaurant owners can manage their own config)
CREATE POLICY "Owners can manage their agent config" ON ai_agent_configs
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM restaurants 
        WHERE restaurants.id = ai_agent_configs.restaurant_id 
        AND restaurants.owner_id = auth.uid()
    )
);

-- Conversation Policies (Restaurant owners can view their conversations)
CREATE POLICY "Owners can view their conversations" ON ai_conversations
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM restaurants 
        WHERE restaurants.id = ai_conversations.restaurant_id 
        AND restaurants.owner_id = auth.uid()
    )
);

-- Allow system to create conversations (for webhook/API)
CREATE POLICY "System can create conversations" ON ai_conversations
FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update conversations" ON ai_conversations
FOR UPDATE USING (true);

-- Message Policies (Restaurant owners can view messages from their conversations)
CREATE POLICY "Owners can view their conversation messages" ON ai_conversation_messages
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM ai_conversations 
        JOIN restaurants ON restaurants.id = ai_conversations.restaurant_id
        WHERE ai_conversations.id = ai_conversation_messages.conversation_id 
        AND restaurants.owner_id = auth.uid()
    )
);

-- Allow system to create messages (for webhook/API)
CREATE POLICY "System can create messages" ON ai_conversation_messages
FOR INSERT WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_agent_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_ai_agent_config_timestamp
    BEFORE UPDATE ON ai_agent_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_agent_config_updated_at();

-- Function to update last_message_at on conversations
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE ai_conversations 
    SET last_message_at = NEW.created_at 
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_message_at when new message is added
CREATE TRIGGER update_conversation_last_message_trigger
    AFTER INSERT ON ai_conversation_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();
