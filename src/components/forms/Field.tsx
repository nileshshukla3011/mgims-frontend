import React from 'react';

// Labelled form controls with hint and error text wired up for screen readers (UX4G 6.8: errors next to the field,
// with the fix). Each control takes the current value and reports the new one.

const inputClass = (invalid: boolean) =>
  `w-full min-h-11 rounded-lg border px-3 py-2 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-brand-blue ${
    invalid ? 'border-red-600 bg-red-50' : 'border-slate-300 bg-white'
  }`;

interface ShellProps {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: (describedBy: string | undefined) => React.ReactNode;
  className?: string;
}

const FieldShell: React.FC<ShellProps> = ({ id, label, required, hint, error, children, className = '' }) => {
  const describedBy = [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold text-slate-700">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {children(describedBy)}
      {hint && <p id={`${id}-hint`} className="mt-1 text-xs text-slate-600">{hint}</p>}
      {error && <p id={`${id}-error`} className="mt-1 text-[12px] font-semibold text-red-700">{error}</p>}
    </div>
  );
};

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  type?: 'text' | 'email' | 'tel' | 'date' | 'number' | 'datetime-local' | 'password' | 'url';
  required?: boolean;
  hint?: string;
  error?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  maxLength?: number;
  min?: string | number;
  max?: string | number;
  placeholder?: string;
  className?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  disabled?: boolean;
  list?: string;
}

export const TextField: React.FC<TextFieldProps> = ({ id, label, value, onChange, onBlur, type = 'text', required, hint, error, className, inputRef, ...rest }) => (
  <FieldShell id={id} label={label} required={required} hint={hint} error={error} className={className}>
    {(describedBy) => (
      <input
        ref={inputRef}
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`${inputClass(Boolean(error))} disabled:bg-slate-100`}
        {...rest}
      />
    )}
  </FieldShell>
);

export const TextAreaField: React.FC<Omit<TextFieldProps, 'type' | 'inputMode' | 'min' | 'max' | 'list'> & { rows?: number }> = ({
  id, label, value, onChange, onBlur, required, hint, error, className, rows = 4, inputRef: _ref, ...rest
}) => (
  <FieldShell id={id} label={label} required={required} hint={hint} error={error} className={className}>
    {(describedBy) => (
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={inputClass(Boolean(error))}
        {...rest}
      />
    )}
  </FieldShell>
);

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
}

export const SelectField: React.FC<SelectFieldProps> = ({ id, label, value, onChange, options, placeholder, required, hint, error, className, disabled }) => (
  <FieldShell id={id} label={label} required={required} hint={hint} error={error} className={className}>
    {(describedBy) => (
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`${inputClass(Boolean(error))} disabled:bg-slate-100`}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    )}
  </FieldShell>
);

export const CheckboxField: React.FC<{
  id: string;
  label: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  hint?: string;
  required?: boolean;
}> = ({ id, label, checked, onChange, error, hint, required }) => {
  const describedBy = [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined;
  return (
    <div>
      <div className="flex items-start gap-2.5">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="mt-0.5 h-5 w-5 shrink-0"
        />
        <label htmlFor={id} className="text-sm text-slate-700">{label}</label>
      </div>
      {hint && <p id={`${id}-hint`} className="ml-7 mt-1 text-xs text-slate-600">{hint}</p>}
      {error && <p id={`${id}-error`} className="ml-7 mt-1 text-[12px] font-semibold text-red-700">{error}</p>}
    </div>
  );
};

/** A group of radio buttons or checkboxes inside a fieldset, so the question is read with each option. */
export const ChoiceGroup: React.FC<{
  id: string;
  legend: string;
  type: 'radio' | 'checkbox';
  options: { value: string; label: string }[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  required?: boolean;
  error?: string;
  hint?: string;
  inline?: boolean;
}> = ({ id, legend, type, options, value, onChange, required, error, hint, inline }) => {
  const selected = Array.isArray(value) ? value : value ? [value] : [];
  const toggle = (v: string) => {
    if (type === 'radio') onChange(v);
    else onChange(selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v]);
  };
  const describedBy = [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined;
  return (
    <fieldset id={id} aria-describedby={describedBy} aria-invalid={error ? true : undefined} tabIndex={-1}>
      <legend className="mb-1 text-xs font-semibold text-slate-700">
        {legend}
        {required && <span aria-hidden="true"> *</span>}
      </legend>
      {hint && <p id={`${id}-hint`} className="mb-1 text-xs text-slate-600">{hint}</p>}
      <div className={inline ? 'flex flex-wrap gap-x-4 gap-y-1' : 'space-y-1'}>
        {options.map((o, i) => (
          <label key={o.value} htmlFor={`${id}-${i}`} className="flex min-h-11 items-center gap-2 text-sm text-slate-800">
            <input
              id={`${id}-${i}`}
              type={type}
              name={id}
              value={o.value}
              checked={selected.includes(o.value)}
              onChange={() => toggle(o.value)}
              className="h-5 w-5 shrink-0"
            />
            {o.label}
          </label>
        ))}
      </div>
      {error && <p id={`${id}-error`} className="mt-1 text-[12px] font-semibold text-red-700">{error}</p>}
    </fieldset>
  );
};
