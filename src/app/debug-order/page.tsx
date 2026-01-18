import { debugOrder } from '@/actions/debug'

export default async function DebugPage() {
    const result = await debugOrder('e306ca07-eaae-431c-b4db-1d5561cd5a95')

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Debug Pedido #e306</h1>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
                {JSON.stringify(result, null, 2)}
            </pre>
        </div>
    )
}
