# Returns and Refunds Policy

## Template Variables & Questions for Cursor

### Variables Required for This Template:

#### Company Information (Can be extracted from codebase):
- `{{COMPANY_NAME}}` - Company name (check package.json, about page, app name)
- `{{WEBSITE_URL}}` - Website URL (check app URL, environment variables, config)
- `{{CONTACT_EMAIL}}` - Contact email (check environment variables, config files)
- `{{CONTACT_PHONE}}` - Contact phone number (check environment variables, config files)
- `{{COMPANY_ADDRESS}}` - Company address (check environment variables, config files)

#### Legal/Compliance Information (Needs user input):
- `{{EFFECTIVE_DATE}}` - When this policy becomes effective
- `{{LAST_UPDATED}}` - When this policy was last updated
- `{{RETURN_WINDOW}}` - Return period (e.g., "30 days", "14 days")
- `{{DEFECT_WINDOW}}` - Time to report defects (e.g., "7 days", "14 days")

#### Business-Specific Information (Needs user input):
- `{{RETURNS_ADDRESS}}` - Physical address for returns
- `{{SUPPORT_EMAIL}}` - Customer support email
- `{{SUPPORT_HOURS}}` - Customer support hours

#### E-commerce Information (Can be partially extracted from codebase):
- Check for payment processing (Stripe, PayPal, etc.)
- Check for product/service types
- Check for subscription models

### Questions Cursor Should Ask User:
1. **Business Type**: "Do you sell physical products, digital products, or services? (Physical/Digital/Services/All)"
2. **Return Window**: "How many days do customers have to return items? (e.g., 30 days)"
3. **Return Shipping**: "Who pays for return shipping on non-defective items? (Customer/Company)"
4. **Digital Products**: "Do you offer refunds on digital products or services? (Yes/No)"
5. **International Sales**: "Do you sell to international customers? (Yes/No)"
6. **Subscription Services**: "Do you offer subscription-based services? (Yes/No)"

---

**Effective Date:** {{EFFECTIVE_DATE}}  
**Last Updated:** {{LAST_UPDATED}}  
**Company:** {{COMPANY_NAME}}  
**Website:** {{WEBSITE_URL}}

## 1. Introduction

This Returns and Refunds Policy outlines the terms and conditions for returning products and requesting refunds from {{COMPANY_NAME}}. We strive to ensure customer satisfaction with all purchases.

## 2. Return Eligibility

### 2.1 Eligible Items
Most items can be returned within {{RETURN_WINDOW}} days of purchase, provided they meet the following criteria:
- **Unused condition:** Item has not been used, worn, or damaged
- **Original packaging:** Item is in its original packaging with all components
- **Proof of purchase:** Valid receipt, invoice, or order confirmation
- **Within timeframe:** Return request is made within the specified return window

### 2.2 Non-Returnable Items
The following items are generally not eligible for return:
- Digital products and software licenses
- Personalized or custom-made items
- Perishable goods and consumables
- Items marked as "final sale" or "non-returnable"
- Items that have been used, damaged, or modified

## 3. Return Process

### 3.1 Initiating a Return
To initiate a return:
- Contact our customer service team
- Provide your order number and reason for return
- Receive return authorization and instructions
- Package the item securely for shipping

### 3.2 Return Shipping
Return shipping costs:
- **Defective items:** We cover return shipping costs
- **Change of mind:** Customer is responsible for return shipping
- **Wrong item received:** We cover return shipping costs
- **Damaged in transit:** We cover return shipping costs

### 3.3 Return Address
Send returns to:
**{{COMPANY_NAME}}**  
**Returns Department**  
**Address:** {{RETURNS_ADDRESS}}

## 4. Refund Processing

### 4.1 Refund Methods
Refunds are typically issued to:
- Original payment method used for purchase
- Store credit or gift card (if requested)
- Bank account for direct transfers
- Alternative payment method (with approval)

### 4.2 Refund Timeline
Refund processing times:
- **Credit card refunds:** 3-5 business days
- **Bank transfers:** 5-10 business days
- **Store credit:** Immediate upon return approval
- **Check refunds:** 7-14 business days

### 4.3 Refund Amount
Refund amounts include:
- Full purchase price of returned items
- Applicable taxes on returned items
- Original shipping costs (if item was defective)
- Processing fees (if applicable)

## 5. Exchange Policy

### 5.1 Exchange Options
We offer exchanges for:
- Different size or color of the same item
- Similar item of equal or lesser value
- Store credit for future purchases
- Gift card for the purchase amount

### 5.2 Exchange Process
To exchange an item:
- Follow the same return process
- Specify your exchange preference
- Receive the new item or credit
- Pay any price difference (if applicable)

## 6. Damaged or Defective Items

### 6.1 Reporting Issues
Report damaged or defective items:
- Within {{DEFECT_WINDOW}} days of delivery
- With photos showing the damage
- Detailed description of the issue
- Original packaging and materials

### 6.2 Resolution Options
For damaged or defective items:
- Full refund including shipping
- Replacement with identical item
- Exchange for similar item
- Store credit for purchase amount

## 7. Special Circumstances

### 7.1 Holiday Returns
Extended return periods may apply during:
- Holiday shopping seasons
- Special promotional periods
- Gift-giving occasions
- Clearance sales

### 7.2 Gift Returns
Gift returns are handled:
- With gift receipt for full refund
- Without receipt for store credit
- At current selling price
- Subject to return policy terms

## 8. International Returns

### 8.1 International Shipping
For international customers:
- Return shipping costs are customer responsibility
- Customs duties and taxes are not refundable
- Return process may take longer
- International shipping restrictions may apply

### 8.2 Currency Conversion
Refunds for international orders:
- Are processed in the original currency
- May be subject to exchange rate fluctuations
- Include any currency conversion fees
- Are processed according to local banking regulations

## 9. Return Exceptions

### 9.1 Final Sale Items
Items marked as "final sale":
- Cannot be returned or exchanged
- Are sold as-is without warranty
- Are not eligible for refunds
- May have limited availability

### 9.2 Custom Orders
Custom or personalized items:
- May have limited return options
- Are subject to customization fees
- May require special handling
- Have specific return timeframes

## 10. Customer Service

### 10.1 Contact Information
For returns and refunds:
**Customer Service**  
**Email:** {{SUPPORT_EMAIL}}  
**Phone:** {{CONTACT_PHONE}}  
**Hours:** {{SUPPORT_HOURS}}

### 10.2 Support Process
Our support team:
- Responds to inquiries within 24 hours
- Provides clear return instructions
- Assists with return authorization
- Tracks return and refund status

## 11. Policy Updates

### 11.1 Modification Rights
We may update this policy:
- To improve customer service
- For legal compliance
- Based on business needs
- With advance notice to customers

### 11.2 Notification
Policy changes are communicated through:
- Website updates
- Email notifications
- Order confirmations
- Customer communications

## 12. Legal Rights

### 12.1 Consumer Protection
This policy does not affect:
- Your statutory consumer rights
- Warranty protections
- Legal remedies available
- Regulatory requirements

### 12.2 Dispute Resolution
If you have concerns:
- Contact our customer service first
- Request escalation to management
- Consider mediation or arbitration
- Pursue legal remedies if necessary

---

*This Returns and Refunds Policy was last updated on {{LAST_UPDATED}}.*
