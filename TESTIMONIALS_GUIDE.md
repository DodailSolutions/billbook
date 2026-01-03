# Testimonial Management System

## Overview
BillBooky now includes a complete testimonial management system that allows admins to add, edit, and manage customer testimonials displayed on the landing page with an automatic carousel.

## Features

### For Visitors
- **Testimonial Carousel**: Automatically rotating customer reviews on the landing page
- **5-star Ratings**: Visual star ratings for each testimonial
- **Customer Details**: Name, company, role, and optional profile images
- **Responsive Design**: Works beautifully on all devices
- **Auto-rotation**: Testimonials automatically cycle every 5 seconds
- **Manual Navigation**: Left/right arrows and dot indicators for manual control

### For Admins
- **Full CRUD Operations**: Create, Read, Update, Delete testimonials
- **Active/Inactive Toggle**: Control which testimonials are displayed
- **Reordering**: Move testimonials up or down to change display order
- **Rich Information**: Add name, company, role, rating, content, and image URL
- **Real-time Updates**: Changes reflect immediately on the landing page

## Database Schema

### Testimonials Table
```sql
- id: UUID (Primary Key)
- name: VARCHAR(255) - Customer name
- company: VARCHAR(255) - Company name (optional)
- role: VARCHAR(255) - Job title (optional)
- content: TEXT - Testimonial text
- rating: INTEGER (1-5) - Star rating
- image_url: TEXT - Profile image URL (optional)
- is_active: BOOLEAN - Visibility on website
- display_order: INTEGER - Display order in carousel
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

### Row Level Security (RLS)
- **Public**: Can view only active testimonials
- **Admins**: Full access to all testimonials (CRUD operations)

## Setup Instructions

### 1. Run Database Migration
Execute the SQL schema file in your Supabase SQL editor:
```bash
supabase-testimonials-schema.sql
```

This will:
- Create the testimonials table
- Set up RLS policies
- Create indexes for performance
- Insert 6 sample testimonials

### 2. Verify API Routes
The following routes are automatically available:
- `GET /api/testimonials` - Public endpoint (active testimonials only)
- `GET /api/admin/testimonials` - Admin endpoint (all testimonials)
- `POST /api/admin/testimonials` - Create testimonial
- `PUT /api/admin/testimonials/[id]` - Update testimonial
- `DELETE /api/admin/testimonials/[id]` - Delete testimonial
- `PATCH /api/admin/testimonials/[id]/reorder` - Reorder testimonial

### 3. Access Admin Dashboard
Navigate to: **`/admin/testimonials`**

Or access via the admin dashboard quick actions card: "Testimonials"

## Admin Dashboard Guide

### Adding a New Testimonial
1. Fill in the form at the top:
   - **Name*** (required): Customer's full name
   - **Company** (optional): Company name
   - **Role** (optional): Job title (e.g., "CEO", "Founder")
   - **Rating*** (required): 1-5 stars
   - **Content*** (required): The testimonial text
   - **Image URL** (optional): URL to profile photo
   - **Active** (checkbox): Display on website

2. Click "Add Testimonial"

### Editing a Testimonial
1. Click the Edit icon (pencil) on any testimonial
2. Modify the fields in the form
3. Click "Update Testimonial"
4. Click "Cancel" to discard changes

### Deleting a Testimonial
1. Click the Delete icon (trash) on any testimonial
2. Confirm the deletion in the popup

### Reordering Testimonials
- Use the **Up Arrow** (↑) button to move a testimonial higher in the list
- Use the **Down Arrow** (↓) button to move it lower
- The carousel displays testimonials in this order

### Active/Inactive Status
- **Active** (green badge with checkmark): Displayed on website
- **Inactive** (gray badge with X): Hidden from website
- Toggle by editing the testimonial

## Landing Page Integration

### Testimonial Section Location
The testimonial carousel appears between the footer and FAQ section on the homepage.

### Carousel Features
- **Auto-play**: Rotates every 5 seconds
- **Manual Controls**: Left/right arrow buttons
- **Dot Indicators**: Click any dot to jump to that testimonial
- **Responsive**: Adapts to mobile, tablet, and desktop screens
- **Smooth Transitions**: Elegant fade and slide animations

### Design
- Clean white cards with subtle shadows
- Large quote icon for visual appeal
- 5-star rating display
- Customer profile section with name, role, and company
- Emerald green accent color matching brand
- Dark mode support

## Sample Testimonials
The system includes 6 pre-populated sample testimonials:

1. **Rajesh Kumar** - Kumar Enterprises
2. **Priya Sharma** - Sharma Consultancy
3. **Amit Patel** - Patel Traders
4. **Sneha Reddy** - Reddy Designs
5. **Vikram Singh** - Singh Logistics
6. **Meena Iyer** - Iyer & Co

Feel free to edit or delete these and add your real customer testimonials.

## Best Practices

### Content Guidelines
- **Length**: Keep testimonials concise (2-3 sentences ideal)
- **Specific**: Include specific benefits or features mentioned
- **Authentic**: Use real customer feedback
- **Varied**: Mix different business types and use cases

### Image Guidelines
- **Size**: 400x400px or larger recommended
- **Format**: JPG, PNG, or WebP
- **Quality**: High-resolution professional photos
- **Hosting**: Use a reliable CDN or Supabase storage

### Rating Guidelines
- Only add 4-5 star testimonials to the public carousel
- Use the active/inactive toggle for testimonials under review

### Display Order
- Place your strongest testimonials first (top of the list)
- Vary business types and industries for diversity
- Update regularly with new customer feedback

## Troubleshooting

### Testimonials Not Showing
1. Check if testimonials are marked as "Active"
2. Verify database migration was successful
3. Check browser console for API errors

### Can't Edit Testimonials
1. Verify you're logged in as super admin
2. Check `user_profiles` table for `is_super_admin = true`
3. Ensure RLS policies are correctly set up

### Images Not Loading
1. Verify image URLs are publicly accessible
2. Check for HTTPS URLs (not HTTP)
3. Test URLs directly in browser

## API Examples

### Fetch Public Testimonials
```javascript
const response = await fetch('/api/testimonials')
const testimonials = await response.json()
```

### Create Testimonial (Admin)
```javascript
const response = await fetch('/api/admin/testimonials', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    company: 'Acme Corp',
    role: 'CEO',
    content: 'Amazing product!',
    rating: 5,
    is_active: true
  })
})
```

## Security

- All admin routes require super admin authentication
- Public API only returns active testimonials
- RLS policies prevent unauthorized access
- Input validation on all forms
- XSS protection on content display

## Footer Updates (Bonus)

### Changes Made
- Updated copyright year: **2025 → 2026**
- Reorganized menu sections:
  - **Product**: Features, Pricing Plans, FAQ, Dashboard
  - **Support**: Help Center, Contact Us, About Us, Email Support
  - **Legal**: Privacy Policy, Terms of Service, Refund Policy
- Enhanced footer text: "Proudly serving Indian businesses with ❤️"
- Added GST compliance badge: "GST Compliant • 100% Free"
- Improved hover effects with transition animations

## Next Steps
1. Run the database migration
2. Access `/admin/testimonials`
3. Add your first real customer testimonial
4. Test the carousel on the homepage
5. Gather more testimonials from satisfied customers!

---

**Need Help?** Contact support or check the admin dashboard for more guidance.
