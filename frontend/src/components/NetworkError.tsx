interface NetworkErrorProps {
  message?: string;
  onRetry?: () => void;
}

export default function NetworkError({
  message = 'Не удалось загрузить данные',
  onRetry,
}: NetworkErrorProps) {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-lg font-semibold text-foreground mb-2">
          {message}
        </h2>
        <p className="text-sm text-muted mb-6">
          Проверьте подключение к интернету и попробуйте снова.
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2.5 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary-hover transition-colors cursor-pointer"
          >
            Повторить запрос
          </button>
        )}
      </div>
    </div>
  );
}
