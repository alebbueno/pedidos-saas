import { CheckCircle2, XCircle, Info, AlertCircle, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
    message: string
    type: ToastType
    onClose: () => void
}

export function Toast({ message, type, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose()
        }, 3000)

        return () => clearTimeout(timer)
    }, [onClose])

    const icons = {
        success: <CheckCircle2 className="w-5 h-5" />,
        error: <XCircle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />,
        warning: <AlertCircle className="w-5 h-5" />,
    }

    const styles = {
        success: 'bg-green-50 text-green-800 border-green-200',
        error: 'bg-red-50 text-red-800 border-red-200',
        info: 'bg-blue-50 text-blue-800 border-blue-200',
        warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    }

    return (
        <div className={`flex items-center gap-3 p-4 rounded-lg border shadow-lg ${styles[type]} animate-in slide-in-from-top-5 duration-300`}>
            {icons[type]}
            <p className="flex-1 text-sm font-medium">{message}</p>
            <button
                onClick={onClose}
                className="hover:opacity-70 transition-opacity"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    )
}

interface ToastContainerProps {
    toasts: Array<{ id: string; message: string; type: ToastType }>
    onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => onRemove(toast.id)}
                />
            ))}
        </div>
    )
}

// Hook para usar toast
export function useToast() {
    const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastType }>>([])

    const showToast = (message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(7)
        setToasts((prev) => [...prev, { id, message, type }])
    }

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }

    return {
        toasts,
        showToast,
        removeToast,
        success: (message: string) => showToast(message, 'success'),
        error: (message: string) => showToast(message, 'error'),
        info: (message: string) => showToast(message, 'info'),
        warning: (message: string) => showToast(message, 'warning'),
    }
}
