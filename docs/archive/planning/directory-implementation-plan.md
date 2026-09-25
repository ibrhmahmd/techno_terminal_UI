# Directory API Implementation Plan

**Version**: 1.0  
**Date**: April 3, 2026  
**Status**: Implementation Ready  
**Compliance**: 100% aligned with documented CRM API specifications  

## Executive Summary

This implementation plan provides a comprehensive roadmap for developing the Directory page API functionality while ensuring complete compliance with the documented CRM API specifications. The plan addresses identified compliance issues, implements clean architecture principles, and provides detailed testing requirements.

## Implementation Objectives

1. **100% API Compliance**: Ensure all implementations match documented specifications exactly
2. **Clean Architecture**: Implement SOLID principles and maintainable code structure
3. **Backward Compatibility**: Support existing functionality while adding new features
4. **Comprehensive Testing**: Achieve 100% test coverage for all API endpoints
5. **Performance Optimization**: Implement efficient database queries and caching strategies

## Phase 1: Schema Compliance (Priority: HIGH)

### 1.1 Interface Updates

#### Student Interface Compliance
**Current Issue**: Field name mismatch (`birth_date` vs `date_of_birth`)
**File**: `app/src/api/crm.ts`

```typescript
// BEFORE (Non-compliant)
export interface Student {
  id: string
  full_name: string
  birth_date?: string | null  // ❌ Should be date_of_birth
  gender?: string | null
  phone?: string | null
  is_active: boolean
  notes?: string | null
}

// AFTER (Compliant)
export interface Student {
  id: string
  full_name: string
  date_of_birth?: string | null  // ✅ Matches documentation
  gender?: string | null
  phone?: string | null
  is_active: boolean
  notes?: string | null
}
```

#### Parent Interface Compliance
**Current Issue**: Missing documented fields
**File**: `app/src/api/crm.ts`

```typescript
// BEFORE (Non-compliant)
export interface Parent {
  id: string
  full_name: string
  phone?: string | null        // ❌ Should be phone_primary
  email?: string | null
  address?: string | null
  is_active: boolean
}

// AFTER (Compliant)
export interface Parent {
  id: string
  full_name: string
  phone_primary?: string | null    // ✅ Matches documentation
  phone_secondary?: string | null // ✅ Added missing field
  email?: string | null
  relation?: string | null         // ✅ Added missing field
  notes?: string | null            // ✅ Added missing field
  address?: string | null
  is_active: boolean
}
```

### 1.2 API Function Updates

#### Update Parent Creation Function
**File**: `app/src/api/crm.ts`

```typescript
// Update createParent function to handle new fields
export async function createParent(parent: Omit<Parent, 'id'>): Promise<Parent> {
  // Ensure all required fields are present
  const compliantParent = {
    full_name: parent.full_name,
    phone_primary: parent.phone_primary || null,
    phone_secondary: parent.phone_secondary || null,
    email: parent.email || null,
    relation: parent.relation || null,
    notes: parent.notes || null,
    address: parent.address || null,
    is_active: parent.is_active ?? true
  }
  
  const response = await client.post<{ data: Parent }>('/crm/parents', compliantParent)
  return response.data.data
}
```

#### Update Parent Update Function
**File**: `app/src/api/crm.ts`

```typescript
// Update updateParent function to handle new fields
export async function updateParent(id: string, parent: Partial<Omit<Parent, 'id'>>): Promise<Parent> {
  // Ensure partial updates maintain field compliance
  const compliantUpdate = {
    ...(parent.full_name && { full_name: parent.full_name }),
    ...(parent.phone_primary !== undefined && { phone_primary: parent.phone_primary }),
    ...(parent.phone_secondary !== undefined && { phone_secondary: parent.phone_secondary }),
    ...(parent.email !== undefined && { email: parent.email }),
    ...(parent.relation !== undefined && { relation: parent.relation }),
    ...(parent.notes !== undefined && { notes: parent.notes }),
    ...(parent.address !== undefined && { address: parent.address }),
    ...(parent.is_active !== undefined && { is_active: parent.is_active })
  }
  
  const response = await client.patch<{ data: Parent }>(`/crm/parents/${id}`, compliantUpdate)
  return response.data.data
}
```

### 1.3 Component Updates

#### Update ParentList Component
**File**: `app/src/components/crm/ParentList.tsx`

```typescript
// Update display logic to use compliant field names
{
  parents.map((parent) => (
    <tr key={parent.id}>
      <td className="px-4 py-3 font-semibold text-on-surface">{parent.full_name}</td>
      <td className="px-4 py-3 text-slate-500">{parent.phone_primary || '-'}</td>
      <td className="px-4 py-3 text-slate-500">{parent.email || '-'}</td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
          parent.is_active
            ? 'bg-green-100 text-green-700'
            : 'bg-slate-100 text-slate-600'
        }`}>
          <span className="material-symbols-outlined text-sm">
            {parent.is_active ? 'check_circle' : 'cancel'}
          </span>
          {parent.is_active ? 'Active' : 'Inactive'}
        </span>
      </td>
    </tr>
  ))
}
```

#### Update ParentForm Component
**File**: `app/src/components/crm/ParentForm.tsx`

```typescript
// Update form state to use compliant field names
const [formData, setFormData] = useState({
  full_name: initialData?.full_name || '',
  phone_primary: initialData?.phone_primary || '',
  phone_secondary: initialData?.phone_secondary || '',
  email: initialData?.email || '',
  relation: initialData?.relation || '',
  notes: initialData?.notes || '',
  address: initialData?.address || '',
  is_active: initialData?.is_active ?? true,
})
```

## Phase 2: Enhanced Validation (Priority: MEDIUM)

### 2.1 Phone Number Validation
**File**: `app/src/utils/validation.ts`

```typescript
export function validatePhoneNumber(phone: string): boolean {
  // E.164 format validation
  const e164Regex = /^\+?[1-9]\d{1,14}$/
  return e164Regex.test(phone.replace(/\s/g, ''))
}

export function normalizePhoneNumber(phone: string): string {
  // Remove spaces and ensure + prefix
  const cleaned = phone.replace(/\s/g, '')
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`
}
```

### 2.2 Email Validation
**File**: `app/src/utils/validation.ts`

```typescript
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
```

### 2.3 Form Validation Integration
**File**: `app/src/components/crm/ParentForm.tsx`

```typescript
import { validatePhoneNumber, validateEmail } from '../../utils/validation'

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault()
  setError(null)
  setIsLoading(true)

  try {
    // Validate required fields
    if (!formData.full_name.trim()) {
      throw new Error('Full name is required')
    }

    // Validate phone numbers if provided
    if (formData.phone_primary && !validatePhoneNumber(formData.phone_primary)) {
      throw new Error('Primary phone number must be in valid format')
    }

    if (formData.phone_secondary && !validatePhoneNumber(formData.phone_secondary)) {
      throw new Error('Secondary phone number must be in valid format')
    }

    // Validate email if provided
    if (formData.email && !validateEmail(formData.email)) {
      throw new Error('Email must be in valid format')
    }

    // Build submission data with all required fields
    const submitData: CreateParentInput = {
      full_name: formData.full_name.trim(),
      is_active: formData.is_active,
      phone_primary: formData.phone_primary ? normalizePhoneNumber(formData.phone_primary) : null,
      phone_secondary: formData.phone_secondary ? normalizePhoneNumber(formData.phone_secondary) : null,
      email: formData.email || null,
      relation: formData.relation || null,
      notes: formData.notes || null,
      address: formData.address || null,
    }

    await onSubmit(submitData)
  } catch (err) {
    setError(err instanceof Error ? err.message : 'An error occurred')
  } finally {
    setIsLoading(false)
  }
}
```

## Phase 3: Testing Implementation (Priority: HIGH)

### 3.1 Unit Tests for API Functions
**File**: `app/src/api/__tests__/crm.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest'
import { createParent, updateParent } from '../crm'
import client from '../client'

vi.mock('../client', () => ({
  default: {
    post: vi.fn(),
    patch: vi.fn()
  }
}))

describe('CRM API - Parent Functions', () => {
  describe('createParent', () => {
    it('should create parent with all required fields', async () => {
      const mockParent = {
        full_name: 'John Doe',
        phone_primary: '+1234567890',
        phone_secondary: null,
        email: 'john@example.com',
        relation: 'Father',
        notes: null,
        address: null,
        is_active: true
      }

      const mockResponse = {
        data: { data: { id: '1', ...mockParent } }
      }

      vi.mocked(client.post).mockResolvedValueOnce(mockResponse)

      const result = await createParent(mockParent)

      expect(client.post).toHaveBeenCalledWith('/crm/parents', mockParent)
      expect(result).toEqual({ id: '1', ...mockParent })
    })

    it('should handle partial parent data', async () => {
      const partialParent = {
        full_name: 'Jane Doe',
        phone_primary: '+0987654321'
      }

      const expectedParent = {
        full_name: 'Jane Doe',
        phone_primary: '+0987654321',
        phone_secondary: null,
        email: null,
        relation: null,
        notes: null,
        address: null,
        is_active: true
      }

      const mockResponse = {
        data: { data: { id: '2', ...expectedParent } }
      }

      vi.mocked(client.post).mockResolvedValueOnce(mockResponse)

      const result = await createParent(partialParent)

      expect(client.post).toHaveBeenCalledWith('/crm/parents', expectedParent)
      expect(result).toEqual({ id: '2', ...expectedParent })
    })
  })
})
```

### 3.2 Component Testing
**File**: `app/src/components/crm/__tests__/ParentForm.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ParentForm } from '../ParentForm'
import userEvent from '@testing-library/user-event'

describe('ParentForm', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should validate phone number format', async () => {
    render(
      <ParentForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        mode="create"
      />
    )

    const phoneInput = screen.getByPlaceholderText('Phone Number')
    const submitButton = screen.getByRole('button', { name: /create parent/i })

    // Invalid phone format
    await userEvent.type(phoneInput, '123')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Primary phone number must be in valid format')).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('should validate email format', async () => {
    render(
      <ParentForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        mode="create"
      />
    )

    const emailInput = screen.getByPlaceholderText('Email')
    const submitButton = screen.getByRole('button', { name: /create parent/i })

    // Invalid email format
    await userEvent.type(emailInput, 'invalid-email')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Email must be in valid format')).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })
})
```

## Phase 4: Performance Optimization (Priority: LOW)

### 4.1 Debounced Search
**File**: `app/src/hooks/useDebounce.ts`

```typescript
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
```

### 4.2 Optimized Search Implementation
**File**: `app/src/pages/DirectoryPage.tsx`

```typescript
import { useDebounce } from '../hooks/useDebounce'

export function DirectoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  
  // Use debounced search term for API calls
  useEffect(() => {
    if (debouncedSearchTerm.length >= 2) {
      // Perform search
      performSearch(debouncedSearchTerm)
    }
  }, [debouncedSearchTerm])
}
```

## Code Cleanup Strategy

### Legacy Code Removal
1. **Remove Deprecated Functions**: Remove `getStudents` and `getParents` functions after migration
2. **Update Imports**: Update all imports to use new compliant interfaces
3. **Clean Mock Data**: Remove hardcoded mock data once backend is integrated

### Refactoring Opportunities
1. **Extract Validation Logic**: Move validation to separate utility functions
2. **Consolidate Error Handling**: Implement consistent error handling across components
3. **Optimize Re-renders**: Use React.memo for expensive components

## Testing Requirements

### Unit Test Coverage
- [ ] **API Functions**: 100% coverage for all CRM API functions
- [ ] **Validation Utilities**: 100% coverage for phone/email validation
- [ ] **Component Logic**: 100% coverage for form validation and state management

### Integration Test Coverage
- [ ] **End-to-End Flows**: Complete user workflows for creating/updating parents and students
- [ ] **API Integration**: Test all API calls with mock responses
- [ ] **Error Handling**: Test all error scenarios and user feedback

### Performance Test Coverage
- [ ] **Search Performance**: Verify debounced search works correctly
- [ ] **Form Validation**: Ensure validation doesn't cause performance issues
- [ ] **API Response Time**: Test with simulated slow network conditions

## Deployment Checklist

### Pre-Deployment
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Code review completed
- [ ] Performance benchmarks met
- [ ] Documentation updated

### Post-Deployment
- [ ] Monitor API response times
- [ ] Track error rates
- [ ] Verify user feedback mechanisms
- [ ] Monitor database query performance

## Success Metrics

### Technical Metrics
- **Test Coverage**: ≥ 95%
- **API Response Time**: ≤ 200ms for standard operations
- **Error Rate**: ≤ 1%
- **Code Quality**: A rating on code quality tools

### User Experience Metrics
- **Form Validation Feedback**: ≤ 100ms response time
- **Search Results**: ≤ 300ms with debouncing
- **Error Message Clarity**: 100% actionable error messages

This implementation plan ensures complete compliance with documented API specifications while maintaining clean architecture principles and comprehensive testing coverage.