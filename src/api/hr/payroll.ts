/**
 * @fileoverview Payroll API Module
 * @deprecated All payroll endpoints are NOT implemented in the backend API.
 * These functions are placeholders for future implementation.
 * Calling any of these functions will throw an error.
 */

// Note: PayrollRecord type is available in './types' if needed for future implementation

/**
 * @deprecated Not implemented in backend API.
 */
export async function getPayroll(_month: string, _year: number): Promise<never> {
  void _month
  void _year
  throw new Error('Payroll endpoints are not implemented in the backend API')
}

/**
 * @deprecated Not implemented in backend API.
 */
export async function processPayroll(_employeeId: number, _month: string, _year: number): Promise<never> {
  void _employeeId
  void _month
  void _year
  throw new Error('Payroll endpoints are not implemented in the backend API')
}

/**
 * @deprecated Not implemented in backend API.
 */
export async function markPayrollPaid(_id: number): Promise<never> {
  void _id
  throw new Error('Payroll endpoints are not implemented in the backend API')
}
