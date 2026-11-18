import Ajv, { AnySchema, ErrorObject } from 'ajv';

export interface ValidationIssue {
  /** JSON pointer to the offending location, '' for the root. */
  path: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

export type Validator = (data: unknown) => ValidationResult;

const ajv = new Ajv({ allErrors: true, strict: false });

function toIssue(error: ErrorObject): ValidationIssue {
  let message = error.message ?? 'ungültig';
  if (error.keyword === 'additionalProperties') {
    message = `unbekannte Eigenschaft "${(error.params as { additionalProperty: string }).additionalProperty}"`;
  } else if (error.keyword === 'required') {
    message = `Pflichtfeld "${(error.params as { missingProperty: string }).missingProperty}" fehlt`;
  }
  return { path: error.instancePath, message };
}

/** Compiles a JSON schema into a validator returning German, path-based issues. */
export function createSchemaValidator(schema: AnySchema): Validator {
  const validateFn = ajv.compile(schema);
  return (data) => {
    const valid = validateFn(data) as boolean;
    return { valid, issues: valid ? [] : (validateFn.errors ?? []).map(toIssue) };
  };
}
