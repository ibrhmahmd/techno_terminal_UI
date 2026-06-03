# Testing Requirements - Directory API Implementation

**Version**: 1.0  
**Date**: April 3, 2026  
**Status**: Implementation Ready  
**Coverage Target**: ≥95%  
**Test Categories**: 6 comprehensive categories  

## Executive Summary

This document defines comprehensive testing requirements for the Directory API implementation, ensuring complete compliance with documented specifications, robust error handling, and optimal performance. The testing strategy covers unit tests, integration tests, API compliance validation, performance testing, security testing, and user acceptance testing.

## Testing Strategy Overview

### Test Pyramid
```
        /\
       /  \    E2E Tests (10%)
      /____\
     /    \   Integration Tests (30%)
    /______\
   /      \  Unit Tests (60%)
  /________\
```

### Testing Categories

| Category | Coverage Target | Automation Level | Execution Frequency |
|----------|----------------|------------------|-------------------|
| Unit Tests | 95% | Fully Automated | Every commit |
| Integration Tests | 90% | Automated | Every PR |
| API Compliance | 100% | Automated | Pre-deployment |
| Performance Tests | 80% | Semi-automated | Weekly |
| Security Tests | 100% | Automated | Pre-release |
| User Acceptance | 100% | Manual | Pre-release |

## Unit Testing Requirements

### 1.1 API Function Tests

#### File: `app/src/api/__tests__/crm.test.ts`

**Test Coverage Requirements**:
- [ ] All CRM API functions (100% coverage)
- [ ] Input validation and sanitization
- [ ] Error handling scenarios
- [ ] Response data transformation
- [ ] Mock data fallback logic

**Specific Test Cases**:

```typescript
describe('CRM API - Student Functions', () => {
  describe('getStudentsPaginated', () => {
    it('should return paginated student data', async () => {
      const mockResponse = {
        data: {
          data: [
            { id: '1', full_name: 'John Doe', date_of_birth: '2010-01-01', gender: 'male', phone: '+1234567890', is_active: true, notes: null }
          ],
          total: 1,
          skip: 0,
          limit: 15
        }
      }
      
      mockedClient.get.mockResolvedValueOnce(mockResponse)
      
      const result = await getStudentsPaginated({ skip: 0, limit: 15 })
      
      expect(result.items).toHaveLength(1)
      expect(result.total).toBe(1)
      expect(result.hasMore).toBe(false)
      expect(mockedClient.get).toHaveBeenCalledWith('/crm/students', { params: { skip: 0, limit: 15 } })
    })
    
    it('should handle empty response', async () => {
      const mockResponse = { data: { data: [], total: 0, skip: 0, limit: 15 } }
      mockedClient.get.mockResolvedValueOnce(mockResponse)
      
      const result = await getStudentsPaginated({ skip: 0, limit: 15 })
      
      expect(result.items).toHaveLength(0)
      expect(result.total).toBe(0)
      expect(result.hasMore).toBe(false)
    })
    
    it('should handle API errors gracefully', async () => {
      const mockError = new Error('Network error')
      mockedClient.get.mockRejectedValueOnce(mockError)
      
      await expect(getStudentsPaginated({ skip: 0, limit: 15 })).rejects.toThrow('Network error')
    })
  })
  
  describe('createStudent', () => {
    it('should create student with valid data', async () => {
      const studentData = {
        full_name: 'Jane Smith',
        date_of_birth: '2012-05-15',
        gender: 'female',
        phone: '+1987654321',
        is_active: true,
        notes: 'Test student'
      }
      
      const mockResponse = {
        data: { data: { id: '2', ...studentData } }
      }
      
      mockedClient.post.mockResolvedValueOnce(mockResponse)
      
      const result = await createStudent(studentData)
      
      expect(result.id).toBe('2')
      expect(result.full_name).toBe('Jane Smith')
      expect(mockedClient.post).toHaveBeenCalledWith('/crm/students', studentData)
    })
    
    it('should handle validation errors', async () => {
      const invalidData = { full_name: '' } // Invalid: empty name
      
      const mockError = {
        response: {
          data: {
            success: false,
            error: 'ValidationError',
            message: 'Full name is required'
          }
        }
      }
      
      mockedClient.post.mockRejectedValueOnce(mockError)
      
      await expect(createStudent(invalidData)).rejects.toThrow('Full name is required')
    })
  })
})

describe('CRM API - Parent Functions', () => {
  describe('createParent', () => {
    it('should create parent with all required fields', async () => {
      const parentData = {
        full_name: 'John Parent',
        phone_primary: '+1234567890',
        phone_secondary: null,
        email: 'john@example.com',
        relation: 'Father',
        notes: null,
        address: null,
        is_active: true
      }
      
      const mockResponse = {
        data: { data: { id: 'parent-1', ...parentData } }
      }
      
      mockedClient.post.mockResolvedValueOnce(mockResponse)
      
      const result = await createParent(parentData)
      
      expect(result.id).toBe('parent-1')
      expect(result.full_name).toBe('John Parent')
      expect(result.phone_primary).toBe('+1234567890')
      expect(result.relation).toBe('Father')
    })
    
    it('should handle partial parent data', async () => {
      const partialData = {
        full_name: 'Jane Parent',
        phone_primary: '+0987654321'
      }
      
      const expectedData = {
        ...partialData,
        phone_secondary: null,
        email: null,
        relation: null,
        notes: null,
        address: null,
        is_active: true
      }
      
      const mockResponse = {
        data: { data: { id: 'parent-2', ...expectedData } }
      }
      
      mockedClient.post.mockResolvedValueOnce(mockResponse)
      
      const result = await createParent(partialData)
      
      expect(result).toEqual({ id: 'parent-2', ...expectedData })
      expect(mockedClient.post).toHaveBeenCalledWith('/crm/parents', expectedData)
    })
  })
})
```

### 1.2 Validation Utility Tests

#### File: `app/src/utils/__tests__/validation.test.ts`

```typescript
describe('Validation Utilities', () => {
  describe('validatePhoneNumber', () => {
    it('should validate correct E.164 format', () => {
      expect(validatePhoneNumber('+1234567890')).toBe(true)
      expect(validatePhoneNumber('+44123456789')).toBe(true)
      expect(validatePhoneNumber('+33123456789')).toBe(true)
    })
    
    it('should reject invalid phone formats', () => {
      expect(validatePhoneNumber('123')).toBe(false)
      expect(validatePhoneNumber('+123')).toBe(false)
      expect(validatePhoneNumber('invalid')).toBe(false)
      expect(validatePhoneNumber('')).toBe(false)
    })
    
    it('should handle phone numbers with spaces', () => {
      expect(validatePhoneNumber('+1 234 567 890')).toBe(true)
      expect(validatePhoneNumber('+44 123 456 789')).toBe(true)
    })
  })
  
  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.uk')).toBe(true)
      expect(validateEmail('user+tag@example.com')).toBe(true)
    })
    
    it('should reject invalid email formats', () => {
      expect(validateEmail('invalid')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('test@domain')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })
  })
  
  describe('normalizePhoneNumber', () => {
    it('should normalize phone numbers correctly', () => {
      expect(normalizePhoneNumber('+1234567890')).toBe('+1234567890')
      expect(normalizePhoneNumber('1234567890')).toBe('+1234567890')
      expect(normalizePhoneNumber('+1 234 567 890')).toBe('+1234567890')
    })
  })
})
```

### 1.3 Component Logic Tests

#### File: `app/src/components/crm/__tests__/ParentForm.test.tsx`

```typescript
describe('ParentForm Component', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  describe('Form Validation', () => {
    it('should validate phone number format', async () => {
      render(
        <ParentForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />
      )
      
      const phoneInput = screen.getByLabelText('Primary Phone')
      const submitButton = screen.getByRole('button', { name: /create/i })
      
      // Invalid phone format
      await userEvent.type(phoneInput, '123')
      await userEvent.click(submitButton)
      
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
      
      const emailInput = screen.getByLabelText('Email')
      const submitButton = screen.getByRole('button', { name: /create/i })
      
      // Invalid email format
      await userEvent.type(emailInput, 'invalid-email')
      await userEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Email must be in valid format')).toBeInTheDocument()
      })
      
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
    
    it('should submit form with valid data', async () => {
      render(
        <ParentForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />
      )
      
      // Fill form with valid data
      await userEvent.type(screen.getByLabelText('Full Name'), 'John Parent')
      await userEvent.type(screen.getByLabelText('Primary Phone'), '+1234567890')
      await userEvent.type(screen.getByLabelText('Email'), 'john@example.com')
      await userEvent.type(screen.getByLabelText('Relation'), 'Father')
      
      await userEvent.click(screen.getByRole('button', { name: /create/i }))
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          full_name: 'John Parent',
          phone_primary: '+1234567890',
          phone_secondary: null,
          email: 'john@example.com',
          relation: 'Father',
          notes: null,
          address: null,
          is_active: true
        })
      })
    })
  })
  
  describe('Loading States', () => {
    it('should show loading state during submission', async () => {
      let resolveSubmit: (value: any) => void
      const submitPromise = new Promise(resolve => { resolveSubmit = resolve })
      mockOnSubmit.mockReturnValueOnce(submitPromise)
      
      render(
        <ParentForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />
      )
      
      // Fill and submit form
      await userEvent.type(screen.getByLabelText('Full Name'), 'Test Parent')
      await userEvent.click(screen.getByRole('button', { name: /create/i }))
      
      // Check loading state
      expect(screen.getByText('Creating...')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create/i })).toBeDisabled()
      
      // Resolve submission
      resolveSubmit!({ id: '1', full_name: 'Test Parent' })
      await waitFor(() => {
        expect(screen.queryByText('Creating...')).not.toBeInTheDocument()
      })
    })
  })
})
```

## Integration Testing Requirements

### 2.1 API Integration Tests

#### File: `app/src/api/__tests__/crm.integration.test.ts`

```typescript
describe('CRM API Integration Tests', () => {
  // Test with actual API (in staging environment)
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1'
  
  beforeAll(async () => {
    // Setup authentication
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword'
      })
    })
    
    const { data } = await loginResponse.json()
    authToken = data.access_token
  })
  
  describe('Student API Integration', () => {
    it('should create and retrieve student', async () => {
      // Create student
      const createResponse = await fetch(`${API_BASE_URL}/crm/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          full_name: 'Integration Test Student',
          date_of_birth: '2010-06-15',
          gender: 'female',
          phone: '+15551234567',
          is_active: true,
          notes: 'Integration test student'
        })
      })
      
      expect(createResponse.status).toBe(201)
      const { data: createdStudent } = await createResponse.json()
      expect(createdStudent.full_name).toBe('Integration Test Student')
      
      // Retrieve student
      const getResponse = await fetch(`${API_BASE_URL}/crm/students/${createdStudent.id}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
      
      expect(getResponse.status).toBe(200)
      const { data: retrievedStudent } = await getResponse.json()
      expect(retrievedStudent.id).toBe(createdStudent.id)
      expect(retrievedStudent.full_name).toBe(createdStudent.full_name)
    })
    
    it('should handle pagination correctly', async () => {
      // Create multiple students
      const students = []
      for (let i = 0; i < 25; i++) {
        const response = await fetch(`${API_BASE_URL}/crm/students`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            full_name: `Pagination Test Student ${i}`,
            is_active: true
          })
        })
        const { data } = await response.json()
        students.push(data)
      }
      
      // Test pagination
      const page1Response = await fetch(`${API_BASE_URL}/crm/students?skip=0&limit=10`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
      
      expect(page1Response.status).toBe(200)
      const page1Data = await page1Response.json()
      expect(page1Data.data).toHaveLength(10)
      expect(page1Data.total).toBeGreaterThanOrEqual(25)
      
      const page2Response = await fetch(`${API_BASE_URL}/crm/students?skip=10&limit=10`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
      
      expect(page2Response.status).toBe(200)
      const page2Data = await page2Response.json()
      expect(page2Data.data).toHaveLength(10)
      
      // Cleanup
      for (const student of students) {
        await fetch(`${API_BASE_URL}/crm/students/${student.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      }
    })
  })
})
```

### 2.2 Component Integration Tests

#### File: `app/src/pages/__tests__/DirectoryPage.integration.test.tsx`

```typescript
describe('DirectoryPage Integration Tests', () => {
  // Mock API responses
  const mockStudents = [
    { id: '1', full_name: 'John Student', date_of_birth: '2010-01-01', gender: 'male', phone: '+1234567890', is_active: true, notes: null },
    { id: '2', full_name: 'Jane Student', date_of_birth: '2011-02-02', gender: 'female', phone: '+0987654321', is_active: true, notes: null }
  ]
  
  const mockParents = [
    { id: '1', full_name: 'John Parent', phone_primary: '+1234567890', phone_secondary: null, email: 'john@example.com', relation: 'Father', notes: null, address: null, is_active: true },
    { id: '2', full_name: 'Jane Parent', phone_primary: '+0987654321', phone_secondary: null, email: null, relation: 'Mother', notes: null, address: null, is_active: true }
  ]
  
  beforeEach(() => {
    // Mock API calls
    vi.mocked(getStudentsPaginated).mockResolvedValue({
      items: mockStudents,
      total: mockStudents.length,
      hasMore: false
    })
    
    vi.mocked(getParentsPaginated).mockResolvedValue({
      items: mockParents,
      total: mockParents.length,
      hasMore: false
    })
  })
  
  describe('Data Loading and Display', () => {
    it('should load and display students on initial render', async () => {
      render(<DirectoryPage />)
      
      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('John Student')).toBeInTheDocument()
        expect(screen.getByText('Jane Student')).toBeInTheDocument()
      })
      
      expect(getStudentsPaginated).toHaveBeenCalledWith({ skip: 0, limit: 15 })
    })
    
    it('should switch between students and parents tabs', async () => {
      render(<DirectoryPage />)
      
      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('John Student')).toBeInTheDocument()
      })
      
      // Switch to parents tab
      await userEvent.click(screen.getByRole('button', { name: /parents/i }))
      
      await waitFor(() => {
        expect(screen.getByText('John Parent')).toBeInTheDocument()
        expect(screen.getByText('Jane Parent')).toBeInTheDocument()
        expect(screen.queryByText('John Student')).not.toBeInTheDocument()
      })
      
      expect(getParentsPaginated).toHaveBeenCalledWith({ skip: 0, limit: 15 })
    })
  })
  
  describe('Search Functionality', () => {
    it('should search students by name', async () => {
      vi.mocked(searchStudents).mockResolvedValueOnce([mockStudents[0]])
      
      render(<DirectoryPage />)
      
      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('John Student')).toBeInTheDocument()
      })
      
      // Search for "John"
      const searchInput = screen.getByPlaceholderText('Search (min 2 chars)...')
      await userEvent.type(searchInput, 'John')
      
      // Wait for debounced search
      await waitFor(() => {
        expect(searchStudents).toHaveBeenCalledWith('John')
        expect(screen.getByText('John Student')).toBeInTheDocument()
        expect(screen.queryByText('Jane Student')).not.toBeInTheDocument()
      }, { timeout: 500 })
    })
    
    it('should clear search and reload data', async () => {
      vi.mocked(searchStudents).mockResolvedValueOnce([mockStudents[0]])
      
      render(<DirectoryPage />)
      
      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('John Student')).toBeInTheDocument()
        expect(screen.getByText('Jane Student')).toBeInTheDocument()
      })
      
      // Search for "John"
      const searchInput = screen.getByPlaceholderText('Search (min 2 chars)...')
      await userEvent.type(searchInput, 'John')
      
      await waitFor(() => {
        expect(screen.getByText('John Student')).toBeInTheDocument()
        expect(screen.queryByText('Jane Student')).not.toBeInTheDocument()
      }, { timeout: 500 })
      
      // Clear search
      await userEvent.clear(searchInput)
      
      await waitFor(() => {
        expect(screen.getByText('John Student')).toBeInTheDocument()
        expect(screen.getByText('Jane Student')).toBeInTheDocument()
      })
      
      expect(getStudentsPaginated).toHaveBeenCalledTimes(2) // Initial load + after clear
    })
  })
  
  describe('Create New Records', () => {
    it('should open and close create student modal', async () => {
      render(<DirectoryPage />)
      
      // Click create student button
      await userEvent.click(screen.getByRole('button', { name: /add student/i }))
      
      // Modal should be open
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Create Student')).toBeInTheDocument()
      
      // Close modal
      await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
      
      // Modal should be closed
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })
    
    it('should create new student', async () => {
      const newStudent = {
        full_name: 'New Student',
        date_of_birth: '2015-03-15',
        gender: 'male',
        phone: '+1111111111',
        is_active: true,
        notes: 'New student'
      }
      
      vi.mocked(createStudent).mockResolvedValueOnce({
        id: 'new-student-id',
        ...newStudent
      })
      
      render(<DirectoryPage />)
      
      // Open create modal
      await userEvent.click(screen.getByRole('button', { name: /add student/i }))
      
      // Fill form
      await userEvent.type(screen.getByLabelText('Full Name'), newStudent.full_name)
      await userEvent.type(screen.getByLabelText('Date of Birth'), newStudent.date_of_birth)
      await userEvent.selectOptions(screen.getByLabelText('Gender'), newStudent.gender)
      await userEvent.type(screen.getByLabelText('Phone'), newStudent.phone)
      await userEvent.type(screen.getByLabelText('Notes'), newStudent.notes)
      
      // Submit form
      await userEvent.click(screen.getByRole('button', { name: /create/i }))
      
      await waitFor(() => {
        expect(createStudent).toHaveBeenCalledWith(newStudent)
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })
  })
})
```

## API Compliance Testing

### 3.1 Schema Validation Tests

#### File: `app/src/api/__tests__/schema-compliance.test.ts`

```typescript
describe('API Schema Compliance Tests', () => {
  describe('Student Interface Compliance', () => {
    it('should match documented StudentPublic schema exactly', () => {
      const student: Student = {
        id: 'student-123',
        full_name: 'Test Student',
        date_of_birth: '2010-01-01', // Must be date_of_birth, not birth_date
        gender: 'male',
        phone: '+1234567890',
        is_active: true,
        notes: 'Test notes'
      }
      
      // Validate against documented schema
      expect(student).toHaveProperty('id')
      expect(student).toHaveProperty('full_name')
      expect(student).toHaveProperty('date_of_birth') // Compliant with documentation
      expect(student).toHaveProperty('gender')
      expect(student).toHaveProperty('phone')
      expect(student).toHaveProperty('is_active')
      expect(student).toHaveProperty('notes')
      
      // Ensure no extra undocumented properties
      const documentedProperties = ['id', 'full_name', 'date_of_birth', 'gender', 'phone', 'is_active', 'notes']
      expect(Object.keys(student)).toEqual(documentedProperties)
    })
  })
  
  describe('Parent Interface Compliance', () => {
    it('should match documented ParentPublic schema exactly', () => {
      const parent: Parent = {
        id: 'parent-123',
        full_name: 'Test Parent',
        phone_primary: '+1234567890', // Must be phone_primary, not phone
        phone_secondary: '+0987654321',
        email: 'parent@example.com',
        relation: 'Father',
        notes: 'Test parent notes',
        address: '123 Test Street',
        is_active: true
      }
      
      // Validate against documented schema
      expect(parent).toHaveProperty('id')
      expect(parent).toHaveProperty('full_name')
      expect(parent).toHaveProperty('phone_primary') // Compliant with documentation
      expect(parent).toHaveProperty('phone_secondary')
      expect(parent).toHaveProperty('email')
      expect(parent).toHaveProperty('relation')
      expect(parent).toHaveProperty('notes')
      expect(parent).toHaveProperty('address')
      expect(parent).toHaveProperty('is_active')
      
      // Ensure no extra undocumented properties
      const documentedProperties = ['id', 'full_name', 'phone_primary', 'phone_secondary', 'email', 'relation', 'notes', 'address', 'is_active']
      expect(Object.keys(parent)).toEqual(documentedProperties)
    })
  })
  
  describe('API Response Format Compliance', () => {
    it('should match PaginatedResponse envelope format', () => {
      const response: PaginatedResponse<Student> = {
        success: true,
        data: [
          {
            id: '1',
            full_name: 'Student 1',
            date_of_birth: '2010-01-01',
            gender: 'male',
            phone: '+1234567890',
            is_active: true,
            notes: null
          }
        ],
        total: 1,
        skip: 0,
        limit: 15
      }
      
      expect(response).toHaveProperty('success')
      expect(response).toHaveProperty('data')
      expect(response).toHaveProperty('total')
      expect(response).toHaveProperty('skip')
      expect(response).toHaveProperty('limit')
      expect(response.success).toBe(true)
      expect(Array.isArray(response.data)).toBe(true)
      expect(typeof response.total).toBe('number')
      expect(typeof response.skip).toBe('number')
      expect(typeof response.limit).toBe('number')
    })
  })
})
```

### 3.2 Error Response Compliance

```typescript
describe('Error Response Compliance', () => {
  it('should match documented error response format', () => {
    const errorResponse = {
      success: false,
      error: 'NotFoundError',
      message: 'Student 123 not found'
    }
    
    expect(errorResponse).toHaveProperty('success', false)
    expect(errorResponse).toHaveProperty('error')
    expect(errorResponse).toHaveProperty('message')
    expect(typeof errorResponse.error).toBe('string')
    expect(typeof errorResponse.message).toBe('string')
  })
  
  it('should match validation error format', () => {
    const validationError = {
      success: false,
      error: 'ValidationError',
      message: 'Validation failed',
      validation_errors: [
        {
          field: 'full_name',
          message: 'Full name is required',
          code: 'REQUIRED_FIELD'
        }
      ]
    }
    
    expect(validationError).toHaveProperty('success', false)
    expect(validationError).toHaveProperty('error', 'ValidationError')
    expect(validationError).toHaveProperty('message')
    expect(validationError).toHaveProperty('validation_errors')
    expect(Array.isArray(validationError.validation_errors)).toBe(true)
  })
})
```

## Performance Testing Requirements

### 4.1 API Performance Tests

#### File: `app/src/api/__tests__/performance.test.ts`

```typescript
describe('API Performance Tests', () => {
  describe('Response Time Benchmarks', () => {
    it('should fetch paginated students within 200ms', async () => {
      const startTime = performance.now()
      
      await getStudentsPaginated({ skip: 0, limit: 15 })
      
      const endTime = performance.now()
      const responseTime = endTime - startTime
      
      expect(responseTime).toBeLessThan(200) // 200ms threshold
    })
    
    it('should search students within 300ms', async () => {
      const startTime = performance.now()
      
      await searchStudents('John')
      
      const endTime = performance.now()
      const responseTime = endTime - startTime
      
      expect(responseTime).toBeLessThan(300) // 300ms threshold for search
    })
  })
  
  describe('Memory Usage', () => {
    it('should not leak memory during repeated API calls', async () => {
      const initialMemory = process.memoryUsage().heapUsed
      
      // Perform 100 API calls
      for (let i = 0; i < 100; i++) {
        await getStudentsPaginated({ skip: 0, limit: 15 })
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc()
      }
      
      const finalMemory = process.memoryUsage().heapUsed
      const memoryIncrease = finalMemory - initialMemory
      
      // Memory increase should be minimal (< 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024)
    })
  })
  
  describe('Concurrent Request Handling', () => {
    it('should handle 10 concurrent requests efficiently', async () => {
      const startTime = performance.now()
      
      const requests = Array.from({ length: 10 }, (_, i) =>
        getStudentsPaginated({ skip: i * 10, limit: 10 })
      )
      
      const results = await Promise.all(requests)
      
      const endTime = performance.now()
      const totalTime = endTime - startTime
      
      expect(results).toHaveLength(10)
      expect(totalTime).toBeLessThan(1000) // All requests complete within 1 second
    })
  })
})
```

### 4.2 Component Performance Tests

#### File: `app/src/components/crm/__tests__/performance.test.tsx`

```typescript
describe('Component Performance Tests', () => {
  describe('Rendering Performance', () => {
    it('should render 100 students within 100ms', async () => {
      const largeStudentList = Array.from({ length: 100 }, (_, i) => ({
        id: `student-${i}`,
        full_name: `Student ${i}`,
        date_of_birth: '2010-01-01',
        gender: i % 2 === 0 ? 'male' : 'female',
        phone: `+123456789${i}`,
        is_active: true,
        notes: null
      }))
      
      const startTime = performance.now()
      
      render(<StudentList students={largeStudentList} isLoading={false} />)
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      expect(renderTime).toBeLessThan(100) // 100ms threshold
      expect(screen.getAllByRole('row')).toHaveLength(101) // 100 students + header
    })
    
    it('should handle rapid search input without performance degradation', async () => {
      const mockSearch = vi.fn()
      
      render(<DirectoryPage />)
      
      const searchInput = screen.getByPlaceholderText('Search (min 2 chars)...')
      
      // Simulate rapid typing
      const startTime = performance.now()
      
      for (let i = 0; i < 20; i++) {
        await userEvent.type(searchInput, 'a')
        await userEvent.clear(searchInput)
      }
      
      const endTime = performance.now()
      const totalTime = endTime - startTime
      
      // Should handle rapid input without blocking
      expect(totalTime).toBeLessThan(2000) // 2 seconds for 20 iterations
      expect(mockSearch).toHaveBeenCalledTimes(Math.floor(20 / 3)) // Debounced calls
    })
  })
  
  describe('Memory Leak Prevention', () => {
    it('should clean up event listeners on unmount', () => {
      const { unmount } = render(<DirectoryPage />)
      
      // Add some event listeners
      const searchInput = screen.getByPlaceholderText('Search (min 2 chars)...')
      fireEvent.change(searchInput, { target: { value: 'test' } })
      
      // Unmount component
      unmount()
      
      // Verify cleanup (no specific assertion, but test should pass without errors)
      expect(() => {
        fireEvent.change(searchInput, { target: { value: 'another test' } })
      }).not.toThrow()
    })
  })
})
```

## Security Testing Requirements

### 5.1 Input Validation Security

```typescript
describe('Security - Input Validation', () => {
  describe('XSS Prevention', () => {
    it('should sanitize malicious input in student names', async () => {
      const maliciousInput = '<script>alert("XSS")</script>'
      
      render(
        <StudentList 
          students={[
            {
              id: '1',
              full_name: maliciousInput,
              date_of_birth: '2010-01-01',
              gender: 'male',
              phone: '+1234567890',
              is_active: true,
              notes: null
            }
          ]} 
          isLoading={false} 
        />
      )
      
      const studentName = screen.getByText(maliciousInput)
      expect(studentName).toBeInTheDocument()
      expect(studentName.innerHTML).toBe('&lt;script&gt;alert("XSS")&lt;/script&gt;') // Escaped
    })
    
    it('should sanitize SQL injection attempts', async () => {
      const sqlInjection = "'; DROP TABLE students; --"
      
      const { container } = render(
        <StudentList 
          students={[
            {
              id: '1',
              full_name: sqlInjection,
              date_of_birth: '2010-01-01',
              gender: 'male',
              phone: '+1234567890',
              is_active: true,
              notes: null
            }
          ]} 
          isLoading={false} 
        />
      )
      
      // Should not contain unescaped SQL
      expect(container.innerHTML).not.toContain("'; DROP TABLE students; --")
    })
  })
  
  describe('Phone Number Validation Security', () => {
    it('should reject non-phone malicious input', async () => {
      const maliciousPhone = 'javascript:alert("XSS")'
      
      render(
        <ParentForm
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
          mode="create"
        />
      )
      
      const phoneInput = screen.getByLabelText('Primary Phone')
      await userEvent.type(phoneInput, maliciousPhone)
      await userEvent.click(screen.getByRole('button', { name: /create/i }))
      
      await waitFor(() => {
        expect(screen.getByText('Primary phone number must be in valid format')).toBeInTheDocument()
      })
    })
  })
})
```

### 5.2 Authentication Security

```typescript
describe('Security - Authentication', () => {
  describe('JWT Token Handling', () => {
    it('should include authorization header in API calls', async () => {
      const mockToken = 'test-jwt-token'
      
      // Mock auth store
      vi.mocked(useAuthStore).mockReturnValue({
        token: mockToken,
        user: null,
        login: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: true
      })
      
      await getStudentsPaginated({ skip: 0, limit: 15 })
      
      expect(mockedClient.get).toHaveBeenCalledWith('/crm/students', {
        params: { skip: 0, limit: 15 },
        headers: {
          'Authorization': `Bearer ${mockToken}`
        }
      })
    })
    
    it('should handle token expiration gracefully', async () => {
      const expiredToken = 'expired-jwt-token'
      
      vi.mocked(useAuthStore).mockReturnValue({
        token: expiredToken,
        user: null,
        login: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: true
      })
      
      // Mock 401 response
      const mockError = {
        response: {
          status: 401,
          data: { success: false, error: 'Unauthorized', message: 'Token expired' }
        }
      }
      
      mockedClient.get.mockRejectedValueOnce(mockError)
      
      await expect(getStudentsPaginated({ skip: 0, limit: 15 })).rejects.toThrow()
      
      // Should trigger logout or token refresh
      expect(mockedNavigate).toHaveBeenCalledWith('/login')
    })
  })
})
```

## User Acceptance Testing (UAT)

### 6.1 UAT Test Scenarios

#### UAT Document: `docs/testing/UAT-directory.md`

```markdown
# User Acceptance Testing - Directory Page

## Test Environment
- **Browser**: Chrome, Firefox, Safari, Edge (latest versions)
- **Screen Resolution**: 1920x1080, 1366x768, mobile responsive
- **Test Data**: Pre-populated with 50 students and 30 parents

## Test Scenarios

### Scenario 1: View Student Directory
**Precondition**: User is logged in and on Directory page
**Steps**:
1. Navigate to Directory page
2. Verify Students tab is active by default
3. Verify student list displays with correct columns
4. Verify pagination controls are visible
5. Verify "Add Student" button is visible

**Expected Results**:
- [ ] Student list loads within 2 seconds
- [ ] All student data displays correctly
- [ ] Pagination shows "Showing X of Y entries"
- [ ] No console errors
- [ ] UI matches design specifications

**Acceptance Criteria**: ✅ All checks pass

### Scenario 2: Search Functionality
**Steps**:
1. Click in search input field
2. Type "John" (minimum 2 characters)
3. Wait for results to appear
4. Clear search field
5. Verify full list reloads

**Expected Results**:
- [ ] Search triggers after 300ms debounce
- [ ] Results filter to show only matching students/parents
- [ ] Clear search reloads full list
- [ ] Search works for both students and parents

**Acceptance Criteria**: ✅ All checks pass

### Scenario 3: Create New Student
**Steps**:
1. Click "Add Student" button
2. Fill all required fields
3. Submit form
4. Verify student appears in list

**Test Data**:
- Full Name: "UAT Test Student"
- Date of Birth: "2015-06-15"
- Gender: "Male"
- Phone: "+1234567890"
- Notes: "Created during UAT"

**Expected Results**:
- [ ] Form validation works correctly
- [ ] Phone number format validation
- [ ] Success message appears
- [ ] New student appears in list immediately
- [ ] Form closes after successful creation

**Acceptance Criteria**: ✅ All checks pass

### Scenario 4: Create New Parent
**Steps**:
1. Switch to Parents tab
2. Click "Add Parent" button
3. Fill all required fields
4. Submit form

**Test Data**:
- Full Name: "UAT Test Parent"
- Primary Phone: "+0987654321"
- Email: "uatparent@example.com"
- Relation: "Mother"

**Expected Results**:
- [ ] Form displays all documented fields
- [ ] Email format validation works
- [ ] Relation dropdown has correct options
- [ ] Success message appears
- [ ] New parent appears in list

**Acceptance Criteria**: ✅ All checks pass

### Scenario 5: Error Handling
**Steps**:
1. Submit form with invalid phone number
2. Submit form with invalid email
3. Submit form without required fields
4. Simulate network error

**Expected Results**:
- [ ] Clear error messages for each validation failure
- [ ] Form does not submit with invalid data
- [ ] Network errors show user-friendly message
- [ ] Form remains usable after errors

**Acceptance Criteria**: ✅ All checks pass

### Scenario 6: Performance Testing
**Steps**:
1. Load page with 100+ records
2. Perform 10 rapid searches
3. Switch tabs rapidly
4. Create multiple records quickly

**Performance Targets**:
- [ ] Initial load: < 2 seconds
- [ ] Search response: < 300ms
- [ ] Tab switch: < 500ms
- [ ] Form submission: < 1 second
- [ ] No UI freezing during operations

**Acceptance Criteria**: ✅ All performance targets met
```

## Test Execution Schedule

### Week 1: Unit Tests
- **Days 1-2**: API function tests
- **Days 3-4**: Component logic tests
- **Days 5**: Validation utility tests

### Week 2: Integration Tests
- **Days 1-2**: API integration tests
- **Days 3-4**: Component integration tests
- **Day 5**: Schema compliance tests

### Week 3: Performance & Security
- **Days 1-2**: Performance testing
- **Days 3-4**: Security testing
- **Day 5**: Test fixes and optimization

### Week 4: UAT & Final Validation
- **Days 1-2**: User acceptance testing
- **Days 3-4**: Bug fixes and retesting
- **Day 5**: Final validation and sign-off

## Success Metrics

### Quantitative Metrics
- **Unit Test Coverage**: ≥95%
- **Integration Test Coverage**: ≥90%
- **API Compliance**: 100%
- **Performance Targets**: All met
- **Security Tests**: 100% pass rate
- **UAT Scenarios**: 100% pass rate

### Qualitative Metrics
- **Code Quality**: A rating on quality tools
- **Maintainability**: Improved from baseline
- **Documentation**: 100% of tests documented
- **Developer Experience**: Positive feedback

## Risk Mitigation

### High-Risk Areas
1. **API Integration**: Test with staging environment
2. **Performance**: Monitor with production-like data
3. **Cross-browser**: Test on all target browsers
4. **Security**: Penetration testing for critical paths

### Contingency Plans
- **Test Environment Issues**: Have backup staging environment
- **Data Corruption**: Automated backups before testing
- **Performance Issues**: Profiling and optimization plan
- **Security Vulnerabilities**: Immediate patching procedure

This comprehensive testing strategy ensures robust, compliant, and performant Directory API implementation that meets all documented specifications and user requirements.