# Frontend Testing Guide - Interview Workflow with Tuteur Selection

## 🧪 Testing the Complete Frontend Workflow

This guide provides step-by-step instructions to test the new interview workflow with tuteur selection functionality.

## 📋 Prerequisites

1. **Backend Server Running**: Ensure the Django backend is running on `http://localhost:8000`
2. **Frontend Server Running**: Ensure the Next.js frontend is running on `http://localhost:3000`
3. **Test Data**: Create test users (RH, Tuteurs, Candidates) in the system
4. **Test Demande**: Create a test demande with status "pending"

## 🔧 Test Setup

### 1. Create Test Users

First, ensure you have the following test users in your system:

**RH User:**
- Username: `test_rh`
- Email: `rh@test.com`
- Role: `rh`
- Company: Test Entreprise

**Tuteur Users:**
- Username: `tuteur1`, Email: `tuteur1@test.com`, Department: IT
- Username: `tuteur2`, Email: `tuteur2@test.com`, Department: Marketing
- Both assigned to Test Entreprise

**Candidate User:**
- Username: `test_candidat`
- Email: `candidat@test.com`
- Role: `candidat`

### 2. Create Test Demande

Create a demande with:
- Status: `pending`
- Candidate: test_candidat
- Company: Test Entreprise

## 🎯 Test Scenarios

### Test Scenario 1: RH Proposes Interview with Tuteur Selection

**Steps:**
1. **Login as RH**
   - Navigate to `http://localhost:3000/login`
   - Login with RH credentials

2. **Navigate to Demandes Page**
   - Go to `/rh/demandes`
   - Verify the page loads without errors

3. **Find Pending Demande**
   - Look for a demande with status "En attente"
   - Click "Voir détails" to open the details modal

4. **Propose Interview**
   - Click "Proposer entretien" button
   - Verify the ScheduleInterviewModal opens

5. **Test Tuteur Selection**
   - Verify the tuteur dropdown is populated
   - Check that tuteurs show availability status (Available, Busy, Full)
   - Check that workload is displayed (X/5 stagiaires)
   - Select a tuteur from the dropdown

6. **Fill Interview Details**
   - Enter a future date
   - Enter a time (e.g., 14:00)
   - Enter a location (e.g., "Salle de réunion A")
   - Click "Proposer"

7. **Verify Success**
   - Check that success toast appears
   - Verify modal closes
   - Check that interview request appears in the demande details

**Expected Results:**
- ✅ Modal opens without errors
- ✅ Tuteur dropdown shows available tuteurs
- ✅ Availability badges work correctly
- ✅ Form validation works
- ✅ Interview proposal is created successfully
- ✅ Success notification appears

### Test Scenario 2: Tuteur Responds to Interview Request

**Steps:**
1. **Login as Tuteur**
   - Navigate to `http://localhost:3000/login`
   - Login with tuteur credentials

2. **Navigate to Evaluations Page**
   - Go to `/tuteur/evaluations`
   - Verify the page loads

3. **Check Pending Interview Requests**
   - Look for the "Demandes d'entretien" section
   - Verify the interview request appears with status "En attente du tuteur"

4. **Respond to Interview Request**
   - Click "Répondre" button
   - Verify InterviewRequestResponseModal opens

5. **Test Accept Option**
   - Click "Accepter" button
   - Add an optional comment
   - Click "Accepter" to submit

6. **Verify Acceptance**
   - Check that success toast appears
   - Verify modal closes
   - Check that status changes to "Validé"

**Expected Results:**
- ✅ Pending interview requests are displayed
- ✅ Response modal opens correctly
- ✅ Accept functionality works
- ✅ Status updates correctly
- ✅ Success notification appears

### Test Scenario 3: Tuteur Proposes New Time

**Steps:**
1. **Login as Tuteur** (if not already logged in)
2. **Navigate to Evaluations Page**
3. **Find Another Pending Interview Request**
4. **Click "Répondre"**
5. **Test Propose New Time Option**
   - Click "Proposer un autre créneau"
   - Enter a new date and time
   - Add a comment explaining the change
   - Click "Proposer"

6. **Verify Proposal**
   - Check that success toast appears
   - Verify status changes to "Révision demandée"

**Expected Results:**
- ✅ Propose new time functionality works
- ✅ Form validation for new date/time
- ✅ Status updates to REVISION_REQUESTED
- ✅ Success notification appears

### Test Scenario 4: RH Responds to Tuteur's Proposal

**Steps:**
1. **Login as RH**
2. **Navigate to Demandes Page**
3. **Find Demande with REVISION_REQUESTED Status**
4. **Open Details Modal**
5. **Find Interview Request with "Révision demandée" Status**
6. **Click "Répondre"**
7. **Test Accept Option**
   - Click "Accepter"
   - Add optional comment
   - Click "Accepter"

8. **Verify Acceptance**
   - Check that status changes to "Validé"
   - Verify candidate is notified

**Expected Results:**
- ✅ RH can see tuteur's proposal
- ✅ Accept functionality works
- ✅ Status updates to VALIDATED
- ✅ Candidate notification is triggered

### Test Scenario 5: RH Modifies Tuteur's Proposal

**Steps:**
1. **Login as RH**
2. **Find Another REVISION_REQUESTED Interview Request**
3. **Click "Répondre"**
4. **Test Modify Option**
   - Click "Proposer un autre créneau"
   - Enter new date and time
   - Add comment
   - Click "Proposer"

5. **Verify Modification**
   - Check that status reverts to "En attente du tuteur"
   - Verify tuteur is notified

**Expected Results:**
- ✅ Modify functionality works
- ✅ Status reverts to PENDING_TUTEUR
- ✅ Tuteur is notified of new proposal

## 🐛 Common Issues to Check

### Frontend Issues:
1. **Component Import Errors**
   - Check browser console for import errors
   - Verify all components are properly exported

2. **API Call Errors**
   - Check Network tab in browser dev tools
   - Verify API endpoints are working
   - Check for CORS issues

3. **State Management Issues**
   - Verify modals open/close correctly
   - Check that data refreshes after actions
   - Ensure loading states work

4. **Form Validation**
   - Test required field validation
   - Verify date/time validation
   - Check tuteur selection validation

### Backend Issues:
1. **Authentication Errors**
   - Check JWT token validity
   - Verify user permissions

2. **Database Issues**
   - Check for missing foreign key relationships
   - Verify data integrity

3. **Email Issues**
   - Check email configuration
   - Verify email templates exist

## 📊 Test Checklist

### RH Functionality:
- [ ] Can access demandes page
- [ ] Can see pending demandes
- [ ] Can open demande details
- [ ] Can propose interview
- [ ] Can select tuteur from dropdown
- [ ] Can see tuteur availability
- [ ] Can respond to tuteur proposals
- [ ] Can accept tuteur suggestions
- [ ] Can modify tuteur suggestions

### Tuteur Functionality:
- [ ] Can access evaluations page
- [ ] Can see pending interview requests
- [ ] Can respond to interview requests
- [ ] Can accept interview proposals
- [ ] Can propose new times
- [ ] Can add comments

### General Functionality:
- [ ] Modals open/close correctly
- [ ] Form validation works
- [ ] Success/error notifications appear
- [ ] Data refreshes after actions
- [ ] Loading states work
- [ ] Responsive design works

## 🚨 Error Handling Tests

### Test Error Scenarios:
1. **Network Errors**
   - Disconnect internet and try to submit forms
   - Verify error messages appear

2. **Validation Errors**
   - Try to submit forms with missing data
   - Verify validation messages appear

3. **Permission Errors**
   - Try to access pages with wrong role
   - Verify access is denied

4. **Server Errors**
   - Test with invalid data
   - Verify error handling works

## 📝 Reporting Issues

When reporting issues, include:
1. **Steps to reproduce**
2. **Expected vs actual behavior**
3. **Browser console errors**
4. **Network tab errors**
5. **Screenshots if applicable**
6. **Browser and OS information**

## 🎉 Success Criteria

The implementation is successful when:
- ✅ All test scenarios pass
- ✅ No console errors
- ✅ All API calls succeed
- ✅ UI is responsive and user-friendly
- ✅ Error handling works correctly
- ✅ Data flows correctly through the system
