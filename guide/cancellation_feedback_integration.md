# Subscription Cancellation Feedback - Frontend Integration Guide

## Overview

This guide explains how to integrate the cancellation feedback system into your frontend. The backend now captures user feedback when they cancel their subscription.

## API Endpoint

### Cancel Subscription with Feedback

**Endpoint**: `DELETE /api/v1/subscription`

**Headers**:

```typescript
{
  "Authorization": "Bearer YOUR_AUTH_TOKEN",
  "Content-Type": "application/json"
}
```

**Request Body** (feedback is optional):

```typescript
{
  feedback?: {
    reason_category: string;  // Required if feedback provided
    reason_details?: string;  // Optional additional details
  }
}
```

**Reason Categories**:

- `too_expensive`
- `missing_features`
- `not_using_enough`
- `found_alternative`
- `technical_issues`
- `poor_content_quality`
- `other` (requires `reason_details`)

**Response**:

```json
{
  "message": "Subscription will be canceled at the end of the current period",
  "subscription": {
    "status": "active",
    "cancel_at_period_end": true,
    "current_period_end": "2026-02-21T10:41:47.000Z"
  }
}
```

## Implementation Steps

### 1. Create Feedback Modal Component

Create a modal/sheet that appears before final cancellation:

````typescript
// components/CancellationFeedbackModal.tsx
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

```bash
# Test cancellation with feedback
curl -X DELETE https://api.example.com/v1/subscription \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "feedback": {
      "reason_category": "missing_features",
      "reason_details": "Need better SEO tools"
    }
  }'
````

interface CancellationFeedbackModalProps {
open: boolean;
onClose: () => void;
onConfirm: (feedback?: { reason_category: string; reason_details?: string }) => void;
}

const CANCELLATION_REASONS = [
{ value: 'too_expensive', label: 'Too expensive' },
{ value: 'missing_features', label: 'Missing features I need' },
{ value: 'not_using_enough', label: 'Not using it enough' },
{ value: 'found_alternative', label: 'Found a better alternative' },
{ value: 'technical_issues', label: 'Experiencing technical issues' },
{ value: 'poor_content_quality', label: 'Content quality issues' },
{ value: 'other', label: 'Other reason' },
];

export function CancellationFeedbackModal({
open,
onClose,
onConfirm
}: CancellationFeedbackModalProps) {
const [selectedReason, setSelectedReason] = useState<string>('');
const [details, setDetails] = useState('');

const handleConfirm = () => {
if (selectedReason) {
onConfirm({
reason_category: selectedReason,
reason_details: details || undefined,
});
} else {
onConfirm(); // Cancel without feedback
}
};

return (
<Sheet open={open} onOpenChange={onClose}>
<SheetContent>
<SheetHeader>
<SheetTitle>We're sorry to see you go</SheetTitle>
</SheetHeader>

        <div className="mt-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Help us improve by letting us know why you're canceling (optional):
          </p>

          <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
            {CANCELLATION_REASONS.map((reason) => (
              <div key={reason.value} className="flex items-center space-x-2">
                <RadioGroupItem value={reason.value} id={reason.value} />
                <Label htmlFor={reason.value}>{reason.label}</Label>
              </div>
            ))}
          </RadioGroup>

          {(selectedReason === 'other' || selectedReason) && (
            <div className="space-y-2">
              <Label htmlFor="details">
                {selectedReason === 'other' ? 'Please tell us more' : 'Additional details (optional)'}
              </Label>
              <Textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Your feedback helps us improve..."
                rows={4}
              />
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Keep Subscription
            </Button>
            <Button variant="destructive" onClick={handleConfirm} className="flex-1">
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>

);
}

````

### 2. Update Cancellation Flow

Integrate the feedback modal into your existing cancellation logic:

```typescript
// Example: In your subscription settings page
import { useMutation } from '@tanstack/react-query';
import { CancellationFeedbackModal } from '@/components/CancellationFeedbackModal';
import { axiosInstance } from '@/lib/axios';

export function SubscriptionSettings() {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const cancelMutation = useMutation({
    mutationFn: async (feedback?: { reason_category: string; reason_details?: string }) => {
      const response = await axiosInstance.delete('/api/v1/subscription', {
        data: { feedback },
      });
      return response.data;
    },
    onSuccess: () => {
      // Show success message
      toast.success('Subscription will be canceled at period end');
      setShowFeedbackModal(false);
      // Refresh subscription data
    },
  });

  const handleCancelClick = () => {
    setShowFeedbackModal(true);
  };

  const handleConfirmCancel = (feedback?: { reason_category: string; reason_details?: string }) => {
    cancelMutation.mutate(feedback);
  };

  return (
    <>
      <Button variant="destructive" onClick={handleCancelClick}>
        Cancel Subscription
      </Button>

      <CancellationFeedbackModal
        open={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onConfirm={handleConfirmCancel}
      />
    </>
  );
}
````

## Best Practices

1. **Make Feedback Optional**: Don't force users to provide feedback - they should be able to skip it
2. **Keep It Simple**: Use radio buttons for predefined reasons, not dropdowns
3. **Validate "Other"**: If user selects "Other", require the details field
4. **Show Empathy**: Use friendly, understanding language in the UI
5. **Don't Block Cancellation**: Even if feedback submission fails, allow the cancellation to proceed
6. **Consider Retention Offers**: Based on the reason, you might show targeted retention offers:
   - "Too expensive" → Offer discount
   - "Missing features" → Show roadmap
   - "Not using enough" → Offer tips/tutorials

## Optional: Retention Offers

You can add conditional retention offers based on the selected reason:

```typescript
{selectedReason === 'too_expensive' && (
  <div className="p-4 bg-blue-50 rounded-lg">
    <p className="font-medium">Special Offer!</p>
    <p className="text-sm">Get 20% off for the next 3 months</p>
    <Button size="sm" className="mt-2">Apply Discount</Button>
  </div>
)}
```

## Testing

1. **Test without feedback**: Ensure cancellation works when user skips feedback
2. **Test each reason**: Verify all reason categories are captured correctly
3. **Test "Other" validation**: Ensure details are required for "Other" reason
4. **Test error handling**: Verify cancellation proceeds even if feedback fails
5. **Check database**: Verify feedback is stored in `subscription_cancellation_feedbacks` table

## Analytics Queries

Once data is collected, you can analyze it:

```sql
-- Cancellation reasons breakdown (last 30 days)
SELECT
  reason_category,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM subscription_cancellation_feedbacks
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY reason_category
ORDER BY count DESC;

-- Average subscription duration by cancellation reason
SELECT
  reason_category,
  AVG(months_subscribed) as avg_months,
  COUNT(*) as count
FROM subscription_cancellation_feedbacks
GROUP BY reason_category
ORDER BY avg_months DESC;
```
