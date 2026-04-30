export default function StarRating({ value, onChange, readonly = false }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`text-2xl leading-none transition-colors ${
            star <= (value ?? 0)
              ? 'text-amber-400'
              : 'text-slate-600'
          } ${!readonly ? 'hover:text-amber-300 cursor-pointer' : 'cursor-default'}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}
