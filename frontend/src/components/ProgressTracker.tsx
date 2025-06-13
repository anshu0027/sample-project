import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { useQuote } from '../context/QuoteContext';
import clsx from 'clsx';

// ------------------------
// Step component: Renders an individual step in the progress tracker.
// ------------------------

const Step = React.memo(({
  number,
  title,
  path,
  isActive,
  isCompleted,
  isClickable,
}: {
  number: number;
  title: string;
  path: string;
  isActive: boolean;
  isCompleted: boolean;
  isClickable: boolean;
}) => {
  // ------------------------
  // Content of a single step, including icon and title.
  // ------------------------
  const stepContent = (
    <div
      className={clsx(
        'flex items-center gap-2 p-2 rounded-lg transition-all duration-300',
        isActive && 'bg-blue-50 shadow-md',
        isClickable ? 'cursor-pointer hover:bg-blue-100/50' : 'cursor-not-allowed opacity-60',
      )}
    >
      <div
        // ------------------------
        // Step number/icon container.
        // ------------------------
        className={clsx(
          'flex items-center justify-center w-8 h-8 rounded-full border-2 shrink-0',
          isActive
            ? 'border-blue-600 bg-blue-600 text-white'
            : isCompleted
              ? 'border-green-500 bg-green-500 text-white'
              : 'border-gray-300 bg-gray-100 text-gray-600',
        )}
      >
        {isCompleted ? (
          <CheckCircle2 size={20} />
        ) : (
          <span className="text-sm font-semibold">{number}</span>
        )}
      </div>
      <span
        // ------------------------
        // Step title.
        // ------------------------
        className={clsx(
          'text-sm font-medium hidden sm:block',
          isActive ? 'text-blue-700' : isCompleted ? 'text-green-600' : 'text-gray-500',
        )}
      >
        {title}
      </span>
    </div>
  );

  // ------------------------
  // If the step is clickable, wrap it in a Link component. Otherwise, render it as a div.
  // ------------------------
  return isClickable ? (
    <Link href={path} className="outline-none">
      {stepContent}
    </Link>
  ) : (
    <div>{stepContent}</div>
  );
});
Step.displayName = 'Step'; // For better debugging

// ------------------------
// Connector component: Renders the connecting line between steps.
// ------------------------
const Connector = ({ isActive }: { isActive: boolean }) => {
  return (
    <div
      className={clsx('w-1 bg-gray-200 transition-colors duration-300', isActive && 'bg-blue-600')}
    />
  );
};

// ------------------------
// Interface for ProgressTracker component props.
// ------------------------
interface ProgressTrackerProps {
  admin?: boolean;
}

// ------------------------
// ProgressTracker component: Displays a series of steps to guide the user through a process.
// It can be configured for either customer or admin flows.
// ------------------------
const ProgressTracker: React.FC<ProgressTrackerProps> = React.memo(({ admin = false }) => {
  // ------------------------
  // Get the current pathname from Next.js navigation.
  // ------------------------
  const pathname = usePathname();
  // ------------------------
  // Access quote state from the QuoteContext.
  // ------------------------
  const { state } = useQuote();

  // ------------------------
  // Define steps for the customer flow.
  // ------------------------
  const customerSteps = [
    { number: 1, title: 'Get Quote', path: '/quote-generator', isCompleted: state.step1Complete },
    {
      number: 2,
      title: 'Event Details',
      path: '/event-information',
      isCompleted: state.step2Complete,
    },
    { number: 3, title: 'Policy Holder', path: '/policy-holder', isCompleted: state.step3Complete },
    { number: 4, title: 'Review', path: '/review', isCompleted: false },
  ];

  // ------------------------
  // Define steps for the admin flow.
  // ------------------------
  const adminSteps = [
    {
      number: 1,
      title: 'Customer Info',
      path: '/admin/create-quote/step1',
      isCompleted: state.step1Complete,
    },
    {
      number: 2,
      title: 'Event Details',
      path: '/admin/create-quote/step2',
      isCompleted: state.step2Complete,
    },
    {
      number: 3,
      title: 'Coverage Options',
      path: '/admin/create-quote/step3',
      isCompleted: state.step3Complete,
    },
    { number: 4, title: 'Review & Submit', path: '/admin/create-quote/step4', isCompleted: false },
  ];

  // ------------------------
  // Select the appropriate set of steps based on the 'admin' prop.
  // ------------------------
  const steps = admin ? adminSteps : customerSteps;

  // ------------------------
  // Determine the index of the current active step based on the pathname.
  // ------------------------
  const currentStepIndex = steps.findIndex((step) => pathname === step.path);

  return (
    // ------------------------
    // Removed mx-auto, w-[64%], and px-2.
    // It will now inherit width/margins from its parent in CustomerLayout.
    // py-4 is for its own internal vertical spacing.
    // ------------------------
    <div className="py-4">
      {/* ------------------------ */}
      {/* Main container for the progress tracker steps. */}
      {/* ------------------------ */}
      <div className="w-full bg-white rounded-xl shadow-lg p-4">
        <div className="flex flex-row gap-2">
          {steps.map((step, index) => (
            <React.Fragment key={step.path}>
              <div className="flex-1 min-w-0">
                <Step
                  number={step.number}
                  title={step.title}
                  path={step.path}
                  isActive={currentStepIndex === index}
                  isCompleted={step.isCompleted}
                  // ------------------------
                  // A step is clickable if it's before or at the current step,
                  // or if it's the next step and the current step is completed.
                  // ------------------------
                  isClickable={
                    index <= currentStepIndex ||
                    (index === currentStepIndex + 1 && steps[currentStepIndex]?.isCompleted)
                  }
                />
              </div>
              {index < steps.length - 1 && (
                // ------------------------
                // Render a connector if it's not the last step.
                // ------------------------
                <div className="flex items-center justify-center h-8">
                  <Connector
                    isActive={
                      currentStepIndex > index || (currentStepIndex === index && step.isCompleted)
                    }
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
});
ProgressTracker.displayName = 'ProgressTracker'; // For better debugging

export default ProgressTracker;
