export default function OrderStatusTracker({ status }) {
  const steps = [
    { key: 'placed',      label: 'Order Placed',   icon: '📋' },
    { key: 'confirmed',   label: 'Confirmed',       icon: '✅' },
    { key: 'processing',  label: 'Processing',      icon: '📦' },
    { key: 'shipped',     label: 'Shipped',         icon: '🚚' },
    { key: 'delivered',   label: 'Delivered',       icon: '🏠' }
  ];

  const failedSteps = ['payment_failed', 'cancelled'];
  const isFailed    = failedSteps.includes(status);

  const currentIndex = isFailed
    ? -1
    : steps.findIndex(s => s.key === status);

  return (
    <div className="w-full py-4">
      {isFailed ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-2xl mb-1">{status === 'cancelled' ? '🚫' : '❌'}</p>
          <p className="font-semibold text-red-700 capitalize">
            {status.replace('_', ' ')}
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between relative">
          {/* Progress line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0" />
          <div
            className="absolute top-5 left-0 h-0.5 bg-green-500 z-0 transition-all duration-500"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          />
          {steps.map((step, i) => (
            <div key={step.key} className="flex flex-col items-center z-10 flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all
                ${i <= currentIndex
                  ? 'bg-green-500 border-green-500 text-white shadow-md'
                  : 'bg-white border-gray-200 text-gray-300'
                }`}
              >
                {step.icon}
              </div>
              <p className={`text-xs mt-2 font-medium text-center leading-tight
                ${i <= currentIndex ? 'text-green-600' : 'text-gray-400'}`}
              >
                {step.label}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}