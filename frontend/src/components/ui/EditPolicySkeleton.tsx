export const EditPolicySkeleton = () => (
  <div className="p-6 animate-pulse">
    {/* Header Skeleton */}
    <div className="flex flex-col sm:flex-row items-center sm:justify-between mb-6 gap-4">
      <div className="h-8 bg-gray-200 rounded w-1/3"></div> {/* Title */}
      <div className="flex gap-2">
        <div className="h-10 bg-gray-200 rounded-md w-32"></div> {/* Version History Button */}
        <div className="h-10 bg-gray-200 rounded-md w-32"></div> {/* Back Button */}
      </div>
    </div>

    {/* Stepper Skeleton */}
    <div className="mb-8 flex flex-row justify-center max-w-4xl mx-auto items-center gap-2 sm:gap-3 md:gap-10">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="h-10 bg-gray-200 rounded-full flex-1 min-w-0 md:flex-initial md:w-48"
        ></div>
      ))}
    </div>

    {/* Form Area Skeleton */}
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div> {/* Form Title */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div> {/* Label */}
            <div className="h-10 bg-gray-200 rounded-md"></div> {/* Input */}
          </div>
        ))}
      </div>
      <div className="mt-8 h-12 bg-gray-200 rounded-md w-1/3 ml-auto"></div>{' '}
      {/* Save/Continue Button */}
    </div>
  </div>
);
