"use client";

import { useCallback, useReducer } from "react";

type FormFieldsAction<T extends Record<string, string>> =
  | {
      type: "setField";
      field: keyof T;
      value: string;
    }
  | {
      type: "setFields";
      value: Partial<T>;
    }
  | {
      type: "reset";
      value: T;
    };

function formFieldsReducer<T extends Record<string, string>>(
  state: T,
  action: FormFieldsAction<T>,
): T {
  if (action.type === "setField") {
    return {
      ...state,
      [action.field]: action.value,
    };
  }

  if (action.type === "setFields") {
    return {
      ...state,
      ...action.value,
    };
  }

  return action.value;
}

export function useFormFields<T extends Record<string, string>>(initial: T) {
  const [fields, dispatch] = useReducer(formFieldsReducer<T>, initial);

  const setField = useCallback((field: keyof T, value: string) => {
    dispatch({
      type: "setField",
      field,
      value,
    });
  }, []);

  const setFields = useCallback((value: Partial<T>) => {
    dispatch({
      type: "setFields",
      value,
    });
  }, []);

  const resetFields = useCallback(() => {
    dispatch({
      type: "reset",
      value: initial,
    });
  }, [initial]);

  return {
    fields,
    setField,
    setFields,
    resetFields,
  };
}
