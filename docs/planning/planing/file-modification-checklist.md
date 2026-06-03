# File Modification Checklist - Directory API Compliance

**Date**: April 3, 2026  
**Status**: Implementation Ready  
**Total Files**: 8 files requiring modification  
**Estimated Time**: 4-6 hours  

## Priority 1: Critical Compliance Issues

### 1. `app/src/api/crm.ts`
**Priority**: HIGH  
**Estimated Time**: 45 minutes  
**Impact**: Core API compliance  

#### Required Changes:
1. **Update Student Interface** (Lines 8-15)
   ```typescript
   // BEFORE
   export interface Student {
     id: string
     full_name: string
     birth_date?: string | null  // ❌ Non-compliant
     gender?: string | null
     phone?: string | null
     is_active: boolean
     notes?: string | null
   }
   
   // AFTER
   export interface Student {
     id: string
     full_name: string
     date_of_birth?: string | null  // ✅ Compliant
     gender?: string | null
     phone?: string | null
     is_active: boolean
     notes?: string | null
   }
   ```

2. **Update Parent Interface** (Lines 17-23)
   ```typescript
   // BEFORE
   export interface Parent {
     id: string
     full_name: string
     phone?: string | null        // ❌ Should be phone_primary
     email?: string | null
     address?: string | null
     is_active: boolean
   }
   
   // AFTER
   export interface Parent {
     id: string
     full_name: string
     phone_primary?: string | null    // ✅ Compliant
     phone_secondary?: string | null // ✅ Added missing field
     email?: string | null
     relation?: string | null        // ✅ Added missing field
     notes?: string | null            // ✅ Added missing field
     address?: string | null
     is_active: boolean
   }
   ```

3. **Update createParent Function** (Lines 85-89)
   ```typescript
   // BEFORE
   export async function createParent(parent: Omit<Parent, 'id'>): Promise<Parent> {
     const response = await client.post<{ data: Parent }>('/crm/parents', parent)
     return response.data.data
   }
   
   // AFTER
   export async function createParent(parent: Omit<Parent, 'id'>): Promise<Parent> {
     const compliantParent = {
       full_name: parent.full_name,
       is_active: parent.is_active,
       phone_primary: parent.phone_primary || null,
       phone_secondary: parent.phone_secondary || null,
       email: parent.email || null,
       relation: parent.relation || null,
       notes: parent.notes || null,
       address: parent.address || null,
     }
     const response = await client.post<{ data: Parent }>('/crm/parents', compliantParent)
     return response.data.data
   }
   ```

4. **Update updateParent Function** (Lines 91-95)
   ```typescript
   // BEFORE
   export async function updateParent(id: string, parent: Partial<Omit<Parent, 'id'>>): Promise<Parent> {
     const response = await client.patch<{ data: Parent }>(`/crm/parents/${id}`, parent)
     return response.data.data
   }
   
   // AFTER
   export async function updateParent(id: string, parent: Partial<Omit<Parent, 'id'>>): Promise<Parent> {
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

### 2. `app/src/components/crm/ParentList.tsx`
**Priority**: HIGH  
**Estimated Time**: 20 minutes  
**Impact**: Display compliance  

#### Required Changes:
1. **Update Table Headers** (Lines 18-22)
   ```typescript
   // BEFORE
   <th className="...">Phone</th>
   
   // AFTER
   <th className="...">Phone</th>
   <th className="...">Email</th>
   <th className="...">Relation</th>
   <th className="...">Notes</th>
   ```

2. **Update Data Display** (Lines 26-45)
   ```typescript
   // BEFORE
   <td className="...">{parent.phone || '-'}</td>
   
   // AFTER
   <td className="...">{parent.phone_primary || '-'}</td>
   <td className="...">{parent.email || '-'}</td>
   <td className="...">{parent.relation || '-'}</td>
   <td className="...">{parent.notes || '-'}</td>
   ```

### 3. `app/src/components/crm/ParentForm.tsx`
**Priority**: HIGH  
**Estimated Time**: 30 minutes  
**Impact**: Form compliance and validation  

#### Required Changes:
1. **Update Form State** (Lines 15-23)
   ```typescript
   // BEFORE
   const [formData, setFormData] = useState({
     full_name: initialData?.full_name || '',
     phone: initialData?.phone || '',
     email: initialData?.email || '',
     address: initialData?.address || '',
     is_active: initialData?.is_active ?? true,
   })
   
   // AFTER
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

2. **Update Form Fields** (Add new fields for phone_secondary, relation, notes)

3. **Update Submit Handler** (Lines 25-50)
   ```typescript
   // Update to use compliant field names
   const submitData: CreateParentInput = {
     full_name: formData.full_name.trim(),
     is_active: formData.is_active,
     phone_primary: formData.phone_primary || null,
     phone_secondary: formData.phone_secondary || null,
     email: formData.email || null,
     relation: formData.relation || null,
     notes: formData.notes || null,
     address: formData.address || null,
   }
   ```

## Priority 2: Validation and Testing

### 4. `app/src/utils/validation.ts` (NEW FILE)
**Priority**: MEDIUM  
**Estimated Time**: 15 minutes  
**Impact**: Data validation compliance  

#### Required Implementation:
```typescript
// Phone number validation (E.164 format)
export function validatePhoneNumber(phone: string): boolean {
  const e164Regex = /^\+?[1-9]\d{1,14}$/
  return e164Regex.test(phone.replace(/\s/g, ''))
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Normalize phone number
export function normalizePhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\s/g, '')
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`
}
```

### 5. `app/src/components/crm/ParentForm.tsx` (Validation Integration)
**Priority**: MEDIUM  
**Estimated Time**: 20 minutes  
**Impact**: Form validation compliance  

#### Required Changes:
1. **Add Validation Logic** (Update handleSubmit function)
   ```typescript
   import { validatePhoneNumber, validateEmail, normalizePhoneNumber } from '../../utils/validation'
   
   // Add validation in handleSubmit
   if (formData.phone_primary && !validatePhoneNumber(formData.phone_primary)) {
     throw new Error('Primary phone number must be in valid format')
   }
   
   if (formData.phone_secondary && !validatePhoneNumber(formData.phone_secondary)) {
     throw new Error('Secondary phone number must be in valid format')
   }
   
   if (formData.email && !validateEmail(formData.email)) {
     throw new Error('Email must be in valid format')
   }
   
   // Normalize phone numbers
   const submitData = {
     ...formData,
     phone_primary: formData.phone_primary ? normalizePhoneNumber(formData.phone_primary) : null,
     phone_secondary: formData.phone_secondary ? normalizePhoneNumber(formData.phone_secondary) : null,
   }
   ```

## Priority 3: Testing Implementation

### 6. `app/src/api/__tests__/crm.test.ts` (NEW FILE)
**Priority**: MEDIUM  
**Estimated Time**: 45 minutes  
**Impact**: API compliance testing  

#### Required Test Coverage:
- Test parent creation with all fields
- Test parent update with partial fields
- Test field validation
- Test error handling

### 7. `app/src/components/crm/__tests__/ParentForm.test.tsx` (NEW FILE)
**Priority**: LOW  
**Estimated Time**: 30 minutes  
**Impact**: Component validation testing  

#### Required Test Coverage:
- Test phone number validation
- Test email validation
- Test form submission with valid data
- Test error message display

## Implementation Sequence

### Phase 1: Core Compliance (2-3 hours)
1. **Update `app/src/api/crm.ts`** (45 min)
2. **Update `app/src/components/crm/ParentList.tsx`** (20 min)
3. **Update `app/src/components/crm/ParentForm.tsx`** (30 min)
4. **Create `app/src/utils/validation.ts`** (15 min)
5. **Integration testing** (30 min)

### Phase 2: Testing Implementation (1-2 hours)
1. **Create API tests** (45 min)
2. **Create component tests** (30 min)
3. **Run full test suite** (15 min)

### Phase 3: Final Validation (30 minutes)
1. **Manual testing of all forms**
2. **Verify API calls in browser**
3. **Check error handling**

## Risk Assessment

### High Risk
- **Interface changes**: May break existing components
- **Form field changes**: May affect user workflows

### Medium Risk
- **Validation logic**: May reject valid data if too strict
- **Phone normalization**: May change user input unexpectedly

### Low Risk
- **Testing implementation**: Only affects development
- **Documentation updates**: No runtime impact

## Mitigation Strategies

1. **Gradual Rollout**: Implement changes in staging first
2. **Backward Compatibility**: Maintain old interfaces during transition
3. **Comprehensive Testing**: Test all edge cases
4. **Rollback Plan**: Keep previous version as backup

## Success Criteria

- [ ] All TypeScript compilation errors resolved
- [ ] All existing functionality preserved
- [ ] New fields properly displayed in UI
- [ ] Validation working correctly
- [ ] All tests passing
- [ ] No console errors or warnings
- [ ] API calls successful with new field names

## Post-Implementation Verification

1. **Manual Testing Checklist**:
   - [ ] Create parent with all fields
   - [ ] Update parent with partial fields
   - [ ] Display parent list with new columns
   - [ ] Test phone number validation
   - [ ] Test email validation
   - [ ] Test error message display

2. **Automated Testing Verification**:
   - [ ] Unit tests passing
   - [ ] Integration tests passing
   - [ ] Code coverage ≥ 95%
   - [ ] No linting errors

This checklist ensures systematic implementation of all required changes while maintaining code quality and functionality.