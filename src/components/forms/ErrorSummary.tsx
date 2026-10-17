import React, { useEffect, useRef } from 'react';

/** After a failed submit: the list of problems at the top of the form, each linking to its field (UX4G 6.8.4). */
export const ErrorSummary: React.FC<{ errors: Record<string, string | undefined>; title?: string; focusKey?: number }> = ({
  errors,
  title = 'Please fix the following',
  focusKey,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const entries = Object.entries(errors).filter((e): e is [string, string] => Boolean(e[1]));
  useEffect(() => {
    if (focusKey) ref.current?.focus();
  }, [focusKey]);
  if (entries.length === 0) return null;
  return (
    <div ref={ref} tabIndex={-1} role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900 focus:outline-2 focus:outline-red-700">
      <p className="font-bold">{title}</p>
      <ul className="mt-1 list-disc space-y-0.5 pl-5">
        {entries.map(([field, message]) => (
          <li key={field}>
            <a
              href={`#${field}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(field)?.focus();
              }}
              className="font-semibold underline"
            >
              {message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
