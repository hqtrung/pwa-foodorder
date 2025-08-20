import { useState, useCallback } from 'react';

export type ValidationRule<T> = {
  validate: (value: T) => boolean;
  message: string;
};

export type FieldValidation<T> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
};

export interface UseFormStateOptions<T> {
  initialValues: T;
  validation?: FieldValidation<T>;
  onSubmit?: (values: T) => void | Promise<void>;
}

export interface UseFormStateReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  isValid: boolean;
  isSubmitting: boolean;
  touched: Partial<Record<keyof T, boolean>>;
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: keyof T, message: string) => void;
  clearError: (field: keyof T) => void;
  clearAllErrors: () => void;
  validateField: (field: keyof T) => boolean;
  validateAll: () => boolean;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  reset: () => void;
  markAsTouched: (field: keyof T) => void;
}

/**
 * Custom hook for managing form state with validation
 */
export function useFormState<T extends Record<string, any>>({
  initialValues,
  validation = {},
  onSubmit
}: UseFormStateOptions<T>): UseFormStateReturn<T> {
  const [values, setFormValues] = useState<T>(initialValues);
  const [errors, setFormErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const setValues = useCallback((newValues: Partial<T>) => {
    setFormValues(prev => ({ ...prev, ...newValues }));
  }, []);

  const setError = useCallback((field: keyof T, message: string) => {
    setFormErrors(prev => ({ ...prev, [field]: message }));
  }, []);

  const clearError = useCallback((field: keyof T) => {
    setFormErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setFormErrors({});
  }, []);

  const markAsTouched = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const validateField = useCallback((field: keyof T): boolean => {
    const fieldValidation = validation[field];
    if (!fieldValidation || fieldValidation.length === 0) {
      return true;
    }

    const value = values[field];
    
    for (const rule of fieldValidation) {
      if (!rule.validate(value)) {
        setError(field, rule.message);
        return false;
      }
    }

    clearError(field);
    return true;
  }, [values, validation, setError, clearError]);

  const validateAll = useCallback((): boolean => {
    let isFormValid = true;
    const newErrors: Partial<Record<keyof T, string>> = {};

    Object.keys(validation).forEach(fieldKey => {
      const field = fieldKey as keyof T;
      const fieldValidation = validation[field];
      
      if (fieldValidation && fieldValidation.length > 0) {
        const value = values[field];
        
        for (const rule of fieldValidation) {
          if (!rule.validate(value)) {
            newErrors[field] = rule.message;
            isFormValid = false;
            break;
          }
        }
      }
    });

    setFormErrors(newErrors);
    return isFormValid;
  }, [values, validation]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (isSubmitting) {
      return;
    }

    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key as keyof T] = true;
      return acc;
    }, {} as Partial<Record<keyof T, boolean>>);
    setTouched(allTouched);

    if (!validateAll()) {
      return;
    }

    if (onSubmit) {
      try {
        setIsSubmitting(true);
        await onSubmit(values);
      } catch (error) {
        // Let the parent component handle the error
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [values, validateAll, onSubmit, isSubmitting]);

  const reset = useCallback(() => {
    setFormValues(initialValues);
    setFormErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    isValid,
    isSubmitting,
    touched,
    setValue,
    setValues,
    setError,
    clearError,
    clearAllErrors,
    validateField,
    validateAll,
    handleSubmit,
    reset,
    markAsTouched
  };
}