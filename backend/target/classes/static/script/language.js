/**
 * language.js — SOT Resort & Hotel
 * Bilingual support: English ↔ Vietnamese
 * Usage: include this script on any page, add data-i18n="key" to elements,
 *        and place <button id="lang-toggle-btn"> in the nav.
 */

const TRANSLATIONS = {
    en: {
        // -------------------------------------------------------------Home page -------------------------------------------------------------
        // ── Nav ───────────────────────────────────────────────
        nav_home: 'HOME',
        nav_service: 'SERVICE',
        nav_about: 'ABOUT US',
        nav_offer: 'OFFER',
        nav_signin: 'SIGN IN',
        nav_booknow: 'BOOK NOW',

        // ── Notification ─────────────────────────────────────────────
        notification_title: 'Notifications',
        notification_empty: 'No new notifications',

        // ── Menu ─────────────────────────────────────────────
        menu_profile: 'Profile',
        menu_dashboard: 'Admin Dashboard',
        menu_rooms: 'Rooms',
        menu_bookings: 'Bookings',
        menu_logout: 'Logout',

        // ── Hero ──────────────────────────────────────────────
        hero_slogan: 'Strive or terminate',

        // ── Services ──────────────────────────────────────────
        services_title: 'SERVICES',
        services_subtitle: 'Outstanding services at SOT',
        service_card_wedding_title: 'Wedding',
        service_card_wedding_sub: 'Luxurious, classy',
        service_card_spa_title: 'Spa',
        service_card_spa_sub: 'Relieve stress and fatigue',
        service_card_cuisine_title: 'Cuisine',
        service_card_cuisine_sub: 'Exquisite culinary creations',

        // ── Villas ────────────────────────────────────────────
        villas_title: 'VILLAS',
        villas_subtitle: 'SOT will definitely bring visitors the most wonderful moments of relaxation.',
        villa_deluxe_balcony: 'DELUXE BALCONY',
        villa_clay_pool_cottages: 'CLAY POOL COTTAGES',
        villa_premium_suite: 'PREMIUM SUITE',
        villa_garden_villa: 'GARDEN VILLA',

        // ── Home Offers (mini cards) ──────────────────────────
        offers_title: 'OFFERS',
        filter_all: 'All',
        filter_stay: 'Stay',
        filter_spa: 'Spa',
        filter_dine: 'Dine',
        home_offer1_title: 'Happy Hour',
        home_offer1_desc: 'Rejuvenate your beauty with our premium treatment packages!',
        home_offer2_title: 'Relaxation',
        home_offer2_desc: 'Enjoy relaxing and restorative treatments at SOT Spa.',
        home_offer3_title: '20% Seafood Discount',
        home_offer3_desc: 'Special package for premium seafood buffet on weekends.',
        home_offer4_title: 'Full Energy Stay',
        home_offer4_desc: 'Experience truly unforgettable romantic moments.',

        // ── Gallery ───────────────────────────────────────────
        gallery_title: 'MEMORABLE MOMENT',

        // ── Chat ──────────────────────────────────────────────
        chat_ai_receptionist: 'AI Receptionist',
        chat_welcome_message: 'Hello! How can I help you?',
        chat_placeholder: 'Type a message...',

        // ── Footer ────────────────────────────────────────────
        footer_newsletter: 'Subscribe to our e-newsletter:',
        footer_email_ph: 'Your email address',
        footer_subscribe: 'SUBSCRIBE',
        footer_address: '147 Mai Dich, Cau Giay, Ha Noi',
        footer_phone: '0242 242 0777 | info@webhotel.vn',
        footer_copyright: '© 2026 SOT. All rights reserved',

        // ── About ─────────────────────────────────────────────
        about_hero_title: 'About us',
        about_intro_title: 'SOT — DESTINATION NOT TO BE MISSED',
        about_intro_body: 'SOT confidently brings you sublime emotions, the most wonderful experiences during your stay. Come to us, we guarantee you won\'t regret it.',
        about_resort_title: 'SOT — RESORT PARADISE',
        about_resort_body1: 'This is not just a luxury resort. It is also about love and passion; our companion and commitment to nature, the environment, culture, and the people living on this land.',
        about_resort_body2: 'Offering a unique style combining traditional Vietnamese features and French architecture, professional services, and a convenient location to ensure guests have a cozy environment to relax after a long day.',
        about_story_title: 'SOT STORY',
        about_story_body1: 'The first time we visited this place, the sea was still wild and not many people knew about it. Dawn broke, the sea was gentle, the sun caressed each wave. The wonderful sounds from the ocean, the wind, and daily life felt as gentle as melodious music.',
        about_story_body2: 'That\'s why we built a high-class resort right in this beautiful land — not just simple accommodation, but a place worth staying. Reward yourself with moments of relaxation at SOT.',
        about_why_title: 'WHY CHOOSE SOT?',
        why_location_title: 'Great location',
        why_location_body: 'Located in the city center and important tourist attractions in the area.',
        why_amenities_title: 'Modern Amenities',
        why_amenities_body: 'Comfortable rooms, free wifi, restaurant and bar, gym, spa, and more.',
        why_style_title: 'Distinctive style',
        why_style_body: 'Combining Vietnamese tradition and French architecture, creating a cozy and classy space.',
        why_service_title: 'Excellent service',
        why_service_body: 'Professionally trained and dedicated staff, always ready to serve you with enthusiasm.',
        about_villas_body: 'With a spacious and comfortable villa system and a dedicated staff, SOT will bring visitors the most wonderful moments of relaxation.',
        btn_explore: 'EXPLORE',

        // ── Service page ──────────────────────────────────────
        service_hero_title: 'Service',
        service_section_title: 'SERVICE',
        service_yolo_title: 'YOLO SPA',
        service_yolo_body: 'Each guest embarks on their own personal sacred healing journey at Yolo Spa. Our spa treatments have been carefully curated to incorporate the ayurvedic elements of water, earth, fire, air, and ether.',
        service_cleanse_title: 'CLEANSE',
        service_cleanse_body: 'Align the chakras and focus on what\'s really important. Get rid of negativity. Emerge renewed, refreshed, and rejuvenated. Balance comes from within; SOT pure food and blissful environment foster a deeper connection with your inner self.',
        service_lifestyle_title: 'COMPREHENSIVE LIFESTYLE',
        service_lifestyle_body: 'A schedule of daily and weekly activities is available including yoga, meditation, personal fitness, aqua fitness, Tai Chi and practitioners. The schedule is always changing depending on availability.',

        // ── Offer page — chrome ───────────────────────────────
        offer_hero_title: 'Offer',
        offer_section_title: 'OFFERS',
        offer_filter_all: 'ALL',
        offer_filter_stay: 'STAY',
        offer_filter_spa: 'SPA',
        offer_filter_dine: 'DINE',
        offer_booknow: 'BOOK NOW',
        offer_rates_label: 'Rates',
        offer_cond_label: 'Conditions',

        // ── Offer 1 — Stay: Clouds ────────────────────────────
        offer1_title: 'Wake up full of energy - Open the door to the clouds',
        offer1_desc: 'Experience truly unforgettable romantic moments with your special someone at SOT.',
        offer1_rate: 'For only 4,000,000 VND/2 people',
        offer1_inc0: 'One night stay for 2 people at 1 bedroom Villages.',
        offer1_inc1: 'Complimentary welcome fresh fruit in the room upon check-in.',
        offer1_inc2: 'Complimentary buffet breakfast at the hotel restaurant.',
        offer1_inc3: 'Get 1 voucher for Red Dao leaf bath (20 minutes) at Spa.',
        offer1_inc4: 'Complimentary evening bed embellishment service with fresh flowers and chocolates.',
        offer1_inc5: 'Complimentary 2 bottles of purified water in the room per day.',
        offer1_inc6: '10% discount on a la carte menu prices at the restaurant.',
        offer1_inc7: '20% off when using services at Spa.',
        offer1_con0: 'The program is valid until December 31, 2025.',
        offer1_con1: 'Price includes 5% service charge and 10% VAT.',
        offer1_con2: 'Weekend surcharge 200,000 VND/room (Friday and Saturday).',
        offer1_con3: 'Surcharge on public holidays 500,000 VND/room.',

        // ── Offer 2 — Stay: Summer ────────────────────────────
        offer2_title: 'Summer promotion',
        offer2_desc: 'Coming to SOT, enjoy a wonderful vacation with interesting experiences and extremely attractive incentives.',
        offer2_rate: 'From 1,150,000 VND/night',
        offer2_inc0: 'Receive 20% discount voucher for food service at hotel restaurant.',
        offer2_inc1: '50% discount for late check-out.',
        offer2_inc2: 'Customers staying 02 consecutive nights: Free 01 local beer or 01 soft drink.',
        offer2_inc3: 'Guests staying 03 consecutive nights or more: 01 free set of laundry/day.',
        offer2_inc4: 'Customers staying 05 consecutive nights or more get one-way airport transfer free.',
        offer2_inc5: 'Free room upgrade for guests in case the room is available.',
        offer2_con0: 'The promotion is valid from April 1, 2024 to September 30, 2025.',
        offer2_con1: 'Please contact us for more information.',

        // ── Offer 3 — Spa: Happy Hour ─────────────────────────
        offer3_title: 'Happy Hour',
        offer3_desc: 'Rejuvenate your beauty with our premium treatment packages!',
        offer3_rate: 'Price from VND 1,200,000++/person.',
        offer3_inc0: 'Enjoy a 60-minute facial and 30-minute back relaxation treatment.',
        offer3_inc1: 'Promotion applies every day from 10:00 am to 2:00 pm.',
        offer3_con0: 'The above offers apply from now until January 31, 2025.',
        offer3_con1: 'Not applicable at the same time and with other offers/promotions.',
        offer3_con2: 'Retreat Week promotion applies to single treatments.',

        // ── Offer 4 — Spa: Relaxation ─────────────────────────
        offer4_title: 'Relaxation',
        offer4_desc: 'Enjoy relaxing and restorative treatments just for you at SOT Spa.',
        offer4_rate: 'Price from VND 950,000++/person.',
        offer4_inc0: 'Enjoy 30 minutes of Indian head relaxation and 45 minutes of back stress relief massage.',
        offer4_inc1: 'Promotion applies every day from 10:00 am to 8:00 pm.',
        offer4_con0: 'The above offers apply from now until January 31, 2025.',
        offer4_con1: 'Not applicable at the same time and with other offers/promotions.',

        // ── Offer 5 — Dine: Buffet ────────────────────────────
        offer5_title: '20% discount on premium seafood buffet on weekends',
        offer5_desc: 'SOT offers a special package with a 20% discount for premium seafood buffet on the weekend.',
        offer5_rate: 'Original price: 969,000++ VND/person — 20% discount price: 775,000++ VND/person',
        offer5_inc0: 'Buffet + soft drinks & juice.',
        offer5_con0: 'For children from 1m - 1m3: 50% of adult price.',
        offer5_con1: 'Contact us to book every Friday and Saturday.',

        // ── Auth modals ───────────────────────────────────────
        modal_login_title: 'Welcome Back',
        modal_login_sub: 'Sign in to access your luxury reservations',
        modal_email_label: 'Email Address',
        modal_pass_label: 'Password',
        modal_pass_ph: 'Enter your password',
        modal_remember: 'Remember me',
        modal_forgot: 'Forgot password?',
        modal_signin_btn: 'Sign In',
        modal_no_account: "Don't have an account?",
        modal_create_link: 'Create one now',
        modal_register_title: 'Begin Your Journey',
        modal_register_sub: 'Create an account to unlock exclusive benefits',
        modal_name_label: 'Full Name',
        modal_phone_label: 'Phone Number',
        modal_pass2_label: 'Password',
        modal_pass2_ph: 'Min 6 characters',
        modal_create_btn: 'Create Account',
        modal_have_account: 'Already have an account?',
        modal_signin_link: 'Sign in here',
        modal_forgot_title: 'Forgot Password',
        modal_forgot_sub: 'Enter your email address and we\'ll send you a link to reset your password',
        modal_forgot_email_label: 'Email Address',
        modal_forgot_submit_btn: 'Submit Reset Link',
        modal_forgot_remember: 'Remembered your password?',
        modal_forgot_back_link: 'Back to Sign In',

        // ── Top bar profile ─────────────────────────────────────────────
        profile_welcome: 'Welcome,',
        profile_back: 'Back to Home',

        // ── Side bar profile ─────────────────────────────────────────────
        // (Admin)
        sidebar_overview: 'Overview',
        sidebar_dashboard: 'Dashboard',
        sidebar_managements: 'Management',
        sidebar_rooms: 'Rooms',
        sidebar_bookings: 'Bookings',
        sidebar_users: 'Users',
        sidebar_finances_feedback: 'Finances & Feedback',
        sidebar_payments: 'Payments',
        sidebar_refundRequests: 'Refund Requests',
        sidebar_reviews: 'Room Reviews',
        sidebar_livechat: 'Live Chat',
        sidebar_logout: 'Sign Out',

        // (Guest)
        sidebar_account: "My Account",
        sidebar_bookings: "My Bookings",
        sidebar_rooms: "Browse Rooms",
        sidebar_create_booking: "Create Booking",
        sidebar_payments: "Payments",
        sidebar_refunds: "Refund Requests",
        sidebar_reviews: "Room Reviews",
        sidebar_signout: "Sign Out",

        // ── Admin dashboard ─────────────────────────────────────────────
        admin_dashboard_title: 'Admin Dashboard',
        admin_dashboard_sub: 'Manage your resort operations',
        admin_stat_users: 'Total Users',
        admin_stat_rooms: 'Total Rooms',
        admin_stat_bookings: 'Total Bookings',
        admin_stat_pending: 'Pending Bookings',
        admin_manage_rooms: 'Manage rooms',
        admin_manage_bookings: 'Manage bookings',
        admin_manage_users: 'Manage users',

        // ── Admin Rooms Management ───────────────────────────
        admin_rooms_title: 'Room Management',
        admin_rooms_sub: 'Add, edit, or remove rooms',
        admin_rooms_add_title: 'Add New Room',
        admin_rooms_label_name: 'Room Name',
        admin_rooms_label_capacity: 'Capacity',
        admin_rooms_label_status: 'Status',
        admin_rooms_status_available: 'AVAILABLE',
        admin_rooms_status_booked: 'BOOKED',
        admin_rooms_status_maintenance: 'MAINTENANCE',
        admin_rooms_label_desc: 'Description',
        admin_rooms_btn_add: 'Add Room',
        admin_rooms_list_title: 'All Rooms',
        admin_rooms_col_id: 'Room ID',
        admin_rooms_col_name: 'Name',
        admin_rooms_col_capacity: 'Capacity',
        admin_rooms_col_status: 'Status',
        admin_rooms_col_action: 'Action',

        // ── Admin Bookings Management ────────────────────────
        admin_bookings_title: 'Booking Management',
        admin_bookings_sub: 'Confirm or cancel guest bookings',
        admin_bookings_list_title: 'All Bookings',
        admin_bookings_col_id: 'Booking ID',
        admin_bookings_col_guest: 'Guest',
        admin_bookings_col_room: 'Room',
        admin_bookings_col_status: 'Status',
        admin_bookings_col_action: 'Action',

        // ── Admin Users Management ───────────────────────────
        admin_users_title: 'User Management',
        admin_users_sub: 'View and manage system accounts',
        admin_users_list_title: 'All Users',
        admin_users_col_id: 'User ID',
        admin_users_col_name: 'Full Name',
        admin_users_col_email: 'Email',
        admin_users_col_role: 'Role',
        admin_users_btn_delete: 'Delete',

        // ── Admin Payments & Finance ─────────────────────────
        admin_payments_title: 'Payment Management',
        admin_payments_sub: 'Track and verify guest transactions',
        admin_total: 'Total Payments',
        admin_pending: 'Pending',
        admin_completed: 'Completed',
        admin_total_revenue: 'Total Revenue',
        admin_payments_stat: 'Status',
        admin_stat_all: 'All',
        admin_stat_pending: 'Pending',
        admin_stat_completed: 'Completed',
        admin_stat_failed: 'Failed',
        admin_payments_method: 'Method',
        admind_method_all: 'All Methods',
        admind_method_card: 'Card',
        admind_method_bankTransfer: 'Bank Transfer',
        admin_method_cash: 'Cash',
        admin_payments_search: 'Search',
        admin_payments_resetBtn: 'RESET',
        admin_payments_col_all: 'All Payments',
        admin_payments_col_id: 'Payment ID',
        admin_payments_col_booking: 'Booking ID',
        admin_payments_col_guest: 'Guest',
        admin_payments_col_amount: 'Amount',
        admin_payments_col_method: 'Method',
        admin_payments_col_status: 'Status',
        admin_payments_col_action: 'Action',
        admin_btn_approve: 'Approve',
        admin_btn_reject: 'Reject',

        // ── Admin Refund Requests ────────────────────────────
        admin_refunds_title: 'Refund Management',
        admin_refunds_sub: 'Handle cancellation refund applications',
        admin_refunds_total_requests: 'Total Requests',
        admin_refunds_pending: 'Pending',
        admin_refunds_approved: 'Approved',
        admin_refunds_rejected: 'Rejected',
        admin_refunds_status: 'Status',
        admin_stat_all: 'All',
        admin_stat_pending: 'Pending',
        admin_stat_approved: 'Approved',
        admin_stat_rejected: 'Rejected',
        admin_refunds_search: 'Search',
        admin_refunds_resetBtn: 'RESET',
        admin_refunds_col_all: 'All Refund Requests',
        admin_refunds_col_id: 'Refund ID',
        admin_refunds_col_guest: 'Guest',
        admin_refunds_col_booking: 'Booking ID',
        admin_refunds_col_reason: 'Reason',
        admin_refunds_col_status: 'Status',
        admin_refunds_col_action: 'Actions',
        admin_actions_approved: 'Approved',
        admin_actions_rejected: 'Rejected',
        admin_actions_deleted: 'Deleted',

        // ── Admin Room Reviews ───────────────────────────────
        admin_reviews_title: 'Reviews Management',
        admin_reviews_sub: 'Moderate guest feedback and ratings',
        admin_reviews_total: 'Total Reviews',
        admin_reviews_avg_rating: 'Avg Rating',
        admin_reviews_published: 'Published',
        admin_reviews_hidden: 'Hidden',
        admin_reviews_ratings_all: 'All Ratings',
        admin_reviews_stat_all: 'All',
        admin_reviews_stat_published: 'Published',
        admin_reviews_stat_hidden: 'Hidden',
        admin_reviews_search: 'Search',
        admin_reviews_resetBtn: 'RESET',
        admin_reviews_col_all: 'All Reviews',
        admin_reviews_col_id: 'Review ID',
        admin_reviews_col_guest: 'Guest',
        admin_reviews_col_booking: 'Booking ID',
        admin_reviews_col_rating: 'Rating',
        admin_reviews_col_content: 'Content',
        admin_reviews_col_status: 'Status',
        admin_reviews_col_action: 'Action',
        admin_reviews_btn_hide: 'Hide',
        admin_reviews_table: 'Table',
        admin_reviews_cards: 'Cards',

        // ── Admin Live Chat ──────────────────────────────────
        admin_chat_title: 'Live Chat Support',
        admin_chat_search_ph: 'Search conversations...',
        admin_chat_no_conv: 'No conversations found',
        admin_chat_select_msg: 'Select a conversation to start chatting',
        admin_chat_input_ph: 'Type a message...',
        admin_chat_btn_resolve: 'Resolve',


        // ── Guest dashboard ─────────────────────────────────────────────
        // ── Account Page ─────────────────────────────────────────────
        account_title: "My Account",
        account_desc: "Manage your personal information",
        personal_info: "Personal Information",
        full_name: "Full Name",
        email: "Email",
        phone: "Phone Number",
        role: "Role",
        quick_actions: "Quick Actions",
        quick_bookings: "View My Bookings",
        quick_create_booking: "Create New Booking",
        quick_payments: "Payments History",
        quick_refunds: "Refund Requests",
        quick_reviews: "Room Reviews",
        quick_rooms: "Browse Rooms",
        btn_edit_profile: "Edit Profile Information",

        // ── Bookings Page ─────────────────────────────────────────────
        bookings_title: "My Bookings",
        bookings_desc: "View and manage your reservations",
        table_room: "Room",
        table_checkin: "Check In",
        table_checkout: "Check Out",
        table_status: "Status",
        table_action: "Action",
        btn_new_booking: "Create New Booking",
        loading_bookings: "Loading bookings...",

        // ── Create Booking Page ─────────────────────────────────────────────
        create_booking_title: "Create New Booking",
        create_booking_desc: "Select room and booking time",
        booking_details: "Booking Details",
        booking_sub: "Fill in the details below to reserve your room",
        label_branch: "Branch",
        label_room: "Room",
        label_note: "Note",
        label_checkin: "Check In",
        label_checkout: "Check Out",
        btn_confirm: "Confirm Booking",
        btn_back_to_list: "Back to List",
        placeholder_note: "Any special requests or notes (optional)",

        // ── Rooms Page ─────────────────────────────────────────────
        rooms_title: "Browse Rooms",
        rooms_desc: "Find the perfect room for your stay",
        filter_title: "Filter",
        filter_type: "Room Type",
        filter_type_all: "All Types",
        filter_capacity: "Capacity",
        filter_capacity_placeholder: "Number of guests",
        filter_price: "Price Range",
        filter_price_all: "All Prices",
        filter_price_1: "Under 500,000 VND",
        filter_price_2: "500,000 - 1,000,000 VND",
        filter_price_over: "Over 1,000,000 VND",
        filter_rating: "Rating",
        filter_rating_all: "All Ratings",
        filter_rating_5: "5 Stars",
        filter_rating_4: "4 Stars and Up",
        filter_rating_3: "3 Stars and Up",
        btn_reset: "Reset Filters",

        // ── Payments Page ─────────────────────────────────────────────
        payments_title: "Payments",
        payments_desc: "Track and submit your payment records",
        payments_stat_total_pay: "Total Payments",
        payments_stat_completed: "Completed",
        payments_stat_total_amount: "Total Paid",
        new_payment: "New Payment",
        label_booking: "Booking",
        label_method: "Payment Method",
        label_amount: "Amount",
        btn_submit_payment: "Submit Payment",
        payments_col: "My Payments",
        payments_col_id: "ID",
        payments_col_booking: "Booking",
        payments_col_amount: "Amount",
        payments_col_method: "Method",
        payments_col_status: "Status",

        // ── Refund Requests Page ─────────────────────────────────────────────
        refunds_title: "Refund Requests",
        refunds_desc: "Submit and track your refund requests",
        refund_info_banner: "Refund requests are reviewed within 3–5 business days.",
        refunds_total: "Total Requests",
        refunds_pending: "Pending",
        refunds_approved: "Approved",
        refunds_new: "New Refund Request",
        refunds_select_booking: "Select Booking",
        label_reason: "Reason for Refund",
        placeholder_reason: "Please describe why you are requesting a refund…",
        btn_submit_refund: "Submit Refund Request",
        refunds_my_requests: "My Refund Requests",
        refunds_col_id: "Request ID",
        refunds_col_booking: "Booking",
        refunds_col_reason: "Reason",
        refunds_col_status: "Status",

        // ── Reviews Page ─────────────────────────────────────────────
        reviews_title: "Room Reviews",
        reviews_desc: "Share your experience and feedback about your stay",
        reviews_total: "Total Reviews",
        reviews_avg_rating: "Avg. Rating",
        reviews_5star: "5-Star Reviews",
        write_review: "Write a Review",
        reviews_select_booking: "Select Booking to Review",
        label_rating: "Your Rating",
        label_review_content: "Your Review",
        placeholder_review: "Tell us about your stay…",
        btn_submit_review: "Submit Review",
        label_my_reviews: "My Reviews",
    },

    vi: {
            // -------------------------------------------------------------Home page -------------------------------------------------------------
        // ── Nav ───────────────────────────────────────────────
        nav_home: 'TRANG CHỦ',
        nav_service: 'DỊCH VỤ',
        nav_about: 'VỀ CHÚNG TÔI',
        nav_offer: 'ƯU ĐÃI',
        nav_signin: 'ĐĂNG NHẬP',
        nav_booknow: 'ĐẶT PHÒNG',

        // ── Notification ─────────────────────────────────────────────
        notification_title: 'Thông báo',
        notification_empty: 'Không có thông báo mới',

        // ── Menu ─────────────────────────────────────────────
        menu_profile: 'Hồ sơ',
        menu_dashboard: 'Bảng điều khiển',
        menu_rooms: 'Phòng',
        menu_bookings: 'Đặt phòng',
        menu_logout: 'Đăng xuất',

        // ── Hero ──────────────────────────────────────────────
        hero_slogan: 'Nỗ lực hoặc thất bại',

        // ── Services ──────────────────────────────────────────
        services_title: 'DỊCH VỤ',
        services_subtitle: 'Dịch vụ nổi bật tại SOT',
        service_card_wedding_title: 'Đám cưới',
        service_card_wedding_sub: 'Sang trọng, đẳng cấp',
        service_card_spa_title: 'Spa',
        service_card_spa_sub: 'Giảm căng thẳng và mệt mỏi',
        service_card_cuisine_title: 'Ẩm thực',
        service_card_cuisine_sub: 'Tinh hoa ẩm thực đặc sắc',

        // ── Villas ────────────────────────────────────────────
        villas_title: 'BIỆT THỰ',
        villas_subtitle: 'SOT chắc chắn sẽ mang đến cho du khách những khoảnh khắc nghỉ ngơi tuyệt vời nhất.',
        villa_deluxe_balcony: 'BAN CÔNG CAO CẤP',
        villa_clay_pool_cottages: 'CĂN HỘ HỒ BƠI',
        villa_premium_suite: 'PHÒNG SUITE CAO CẤP',
        villa_garden_villa: 'BIỆT THỰ VƯỜN',

        // ── Home Offers (mini cards) ──────────────────────────
        offers_title: 'ƯU ĐÃI',
        filter_all: 'Tất cả',
        filter_stay: 'Lưu trú',
        filter_spa: 'Spa',
        filter_dine: 'Ẩm thực',
        home_offer1_title: 'Giờ Vàng',
        home_offer1_desc: 'Tái tạo vẻ đẹp với các gói chăm sóc cao cấp của chúng tôi!',
        home_offer2_title: 'Thư Giãn',
        home_offer2_desc: 'Tận hưởng các liệu pháp thư giãn và phục hồi tại SOT Spa.',
        home_offer3_title: 'Giảm 20% Buffet Hải Sản',
        home_offer3_desc: 'Gói đặc biệt cho buffet hải sản cao cấp vào cuối tuần.',
        home_offer4_title: 'Lưu Trú Tràn Năng Lượng',
        home_offer4_desc: 'Trải nghiệm những khoảnh khắc lãng mạn không thể quên.',

        // ── Gallery ───────────────────────────────────────────
        gallery_title: 'KHOẢNH KHẮC ĐÁNG NHỚ',

        // ── Chat ──────────────────────────────────────────────
        chat_ai_receptionist: 'Lễ tân AI',
        chat_welcome_message: 'Xin chào! Tôi có thể giúp gì cho bạn?',
        chat_placeholder: 'Nhập tin nhắn...',

        // ── Footer ────────────────────────────────────────────
        footer_newsletter: 'Đăng ký nhận bản tin của chúng tôi:',
        footer_email_ph: 'Địa chỉ email của bạn',
        footer_subscribe: 'ĐĂNG KÝ',
        footer_address: '147 Mai Dịch, Cầu Giấy, Hà Nội',
        footer_phone: '0242 242 0777 | info@webhotel.vn',
        footer_copyright: '© 2026 SOT. Bản quyền thuộc về SOT',

        // ── About ─────────────────────────────────────────────
        about_hero_title: 'Về chúng tôi',
        about_intro_title: 'SOT — ĐIỂM ĐẾN KHÔNG THỂ BỎ LỠ',
        about_intro_body: 'SOT tự tin mang đến cho bạn những cảm xúc thăng hoa, những trải nghiệm tuyệt vời nhất trong thời gian lưu trú. Đến với chúng tôi, chúng tôi cam kết bạn sẽ không hối tiếc.',
        about_resort_title: 'SOT — THIÊN ĐƯỜNG NGHỈ DƯỠNG',
        about_resort_body1: 'Đây không chỉ là một khu nghỉ dưỡng sang trọng. Đó còn là tình yêu và đam mê; là sự đồng hành và cam kết của chúng tôi với thiên nhiên, môi trường, văn hóa và những con người đang sống trên mảnh đất này.',
        about_resort_body2: 'Mang phong cách độc đáo kết hợp giữa nét truyền thống Việt Nam và kiến trúc Pháp, dịch vụ chuyên nghiệp và vị trí thuận tiện, đảm bảo mang đến cho khách không gian thoải mái để thư giãn sau một ngày dài.',
        about_story_title: 'CÂU CHUYỆN SOT',
        about_story_body1: 'Lần đầu tiên chúng tôi đến nơi này, biển vẫn còn hoang sơ và ít người biết đến. Bình minh ló dạng, biển êm dịu, nắng vuốt ve từng con sóng. Những âm thanh tuyệt vời từ đại dương, gió và cuộc sống thường ngày nhẹ nhàng như giai điệu âm nhạc.',
        about_story_body2: 'Đó là lý do chúng tôi xây dựng khu nghỉ dưỡng cao cấp ngay tại vùng đất tươi đẹp này — không chỉ là chỗ nghỉ đơn thuần, mà là nơi xứng đáng để lưu lại. Hãy tự thưởng cho bản thân những khoảnh khắc thư giãn tại SOT.',
        about_why_title: 'TẠI SAO CHỌN SOT?',
        why_location_title: 'Vị trí đắc địa',
        why_location_body: 'Nằm ở trung tâm thành phố và gần các điểm du lịch quan trọng trong khu vực.',
        why_amenities_title: 'Tiện nghi hiện đại',
        why_amenities_body: 'Phòng tiện nghi, wifi miễn phí, nhà hàng và quầy bar, phòng gym, spa và nhiều hơn nữa.',
        why_style_title: 'Phong cách đặc trưng',
        why_style_body: 'Kết hợp truyền thống Việt Nam và kiến trúc Pháp, tạo nên không gian ấm cúng và sang trọng.',
        why_service_title: 'Dịch vụ xuất sắc',
        why_service_body: 'Đội ngũ nhân viên được đào tạo chuyên nghiệp và tận tâm, luôn sẵn sàng phục vụ bạn nhiệt tình.',
        about_villas_body: 'Với hệ thống biệt thự rộng rãi, thoải mái và đội ngũ nhân viên tận tâm, SOT sẽ mang đến cho du khách những khoảnh khắc nghỉ ngơi tuyệt vời nhất.',
        btn_explore: 'KHÁM PHÁ',

        // ── Service page ──────────────────────────────────────
        service_hero_title: 'Dịch Vụ',
        service_section_title: 'DỊCH VỤ',
        service_yolo_title: 'YOLO SPA',
        service_yolo_body: 'Mỗi vị khách bắt đầu hành trình chữa lành thiêng liêng của riêng mình tại Yolo Spa. Các liệu pháp spa của chúng tôi được chọn lọc kỹ càng, kết hợp các yếu tố Ayurvedic: nước, đất, lửa, không khí và không gian.',
        service_cleanse_title: 'THANH LỌC',
        service_cleanse_body: 'Cân bằng luân xa và tập trung vào điều thực sự quan trọng. Loại bỏ tiêu cực. Bước ra với sự đổi mới, tươi tắn và phục hồi. Sự cân bằng đến từ bên trong; thực phẩm thuần khiết và môi trường an yên tại SOT nuôi dưỡng sự kết nối sâu sắc hơn với bản thân bạn.',
        service_lifestyle_title: 'LỐI SỐNG TOÀN DIỆN',
        service_lifestyle_body: 'Lịch hoạt động hàng ngày và hàng tuần bao gồm yoga, thiền định, thể dục cá nhân, thể dục dưới nước, Thái Cực Quyền và các chuyên gia. Lịch trình luôn thay đổi tùy theo khả năng.',

        // ── Offer page — chrome ───────────────────────────────
        offer_hero_title: 'Ưu Đãi',
        offer_section_title: 'ƯU ĐÃI',
        offer_filter_all: 'TẤT CẢ',
        offer_filter_stay: 'LƯU TRÚ',
        offer_filter_spa: 'SPA',
        offer_filter_dine: 'ẨM THỰC',
        offer_booknow: 'ĐẶT NGAY',
        offer_rates_label: 'Giá',
        offer_cond_label: 'Điều kiện',

        // ── Offer 1 — Stay: Clouds ────────────────────────────
        offer1_title: 'Thức dậy tràn năng lượng - Mở cửa đón mây trời',
        offer1_desc: 'Trải nghiệm những khoảnh khắc lãng mạn thực sự không thể quên cùng người thân yêu tại SOT.',
        offer1_rate: 'Chỉ với 4.000.000 VND/2 người',
        offer1_inc0: 'Một đêm lưu trú cho 2 người tại biệt thự 1 phòng ngủ.',
        offer1_inc1: 'Trái cây tươi chào mừng miễn phí trong phòng khi nhận phòng.',
        offer1_inc2: 'Bữa sáng buffet miễn phí tại nhà hàng khách sạn.',
        offer1_inc3: 'Tặng 1 voucher tắm lá dao đỏ (20 phút) tại Spa.',
        offer1_inc4: 'Dịch vụ trang trí giường buổi tối miễn phí với hoa tươi và socola.',
        offer1_inc5: 'Miễn phí 2 chai nước tinh khiết trong phòng mỗi ngày.',
        offer1_inc6: 'Giảm 10% giá thực đơn gọi món tại nhà hàng.',
        offer1_inc7: 'Giảm 20% khi sử dụng dịch vụ tại Spa.',
        offer1_con0: 'Chương trình có hiệu lực đến ngày 31 tháng 12 năm 2025.',
        offer1_con1: 'Giá đã bao gồm phụ thu dịch vụ 5% và VAT 10%.',
        offer1_con2: 'Phụ thu cuối tuần 200.000 VND/phòng (Thứ Sáu và Thứ Bảy).',
        offer1_con3: 'Phụ thu ngày lễ 500.000 VND/phòng.',

        // ── Offer 2 — Stay: Summer ────────────────────────────
        offer2_title: 'Khuyến mãi mùa hè',
        offer2_desc: 'Đến với SOT, tận hưởng kỳ nghỉ tuyệt vời với những trải nghiệm thú vị và ưu đãi cực kỳ hấp dẫn.',
        offer2_rate: 'Từ 1.150.000 VND/đêm',
        offer2_inc0: 'Nhận voucher giảm giá 20% cho dịch vụ ẩm thực tại nhà hàng khách sạn.',
        offer2_inc1: 'Giảm 50% phụ thu trả phòng muộn.',
        offer2_inc2: 'Khách lưu trú 02 đêm liên tiếp: Miễn phí 01 bia địa phương hoặc 01 nước ngọt.',
        offer2_inc3: 'Khách lưu trú từ 03 đêm liên tiếp trở lên: 01 bộ giặt ủi miễn phí/ngày.',
        offer2_inc4: 'Khách lưu trú từ 05 đêm liên tiếp trở lên được đưa đón sân bay 1 chiều miễn phí.',
        offer2_inc5: 'Nâng hạng phòng miễn phí cho khách nếu phòng còn trống.',
        offer2_con0: 'Khuyến mãi có hiệu lực từ ngày 1 tháng 4 năm 2024 đến ngày 30 tháng 9 năm 2025.',
        offer2_con1: 'Vui lòng liên hệ với chúng tôi để biết thêm thông tin.',

        // ── Offer 3 — Spa: Happy Hour ─────────────────────────
        offer3_title: 'Giờ Vàng',
        offer3_desc: 'Tái tạo vẻ đẹp của bạn với các gói chăm sóc cao cấp của chúng tôi!',
        offer3_rate: 'Giá từ 1.200.000 VND++/người.',
        offer3_inc0: 'Tận hưởng liệu pháp chăm sóc da mặt 60 phút và thư giãn lưng 30 phút.',
        offer3_inc1: 'Khuyến mãi áp dụng hàng ngày từ 10:00 sáng đến 2:00 chiều.',
        offer3_con0: 'Các ưu đãi trên áp dụng từ bây giờ đến ngày 31 tháng 1 năm 2025.',
        offer3_con1: 'Không áp dụng cùng lúc với các ưu đãi/khuyến mãi khác.',
        offer3_con2: 'Khuyến mãi Tuần Retreat áp dụng cho các liệu trình đơn lẻ.',

        // ── Offer 4 — Spa: Relaxation ─────────────────────────
        offer4_title: 'Thư Giãn',
        offer4_desc: 'Tận hưởng các liệu pháp thư giãn và phục hồi dành riêng cho bạn tại SOT Spa.',
        offer4_rate: 'Giá từ 950.000 VND++/người.',
        offer4_inc0: 'Tận hưởng 30 phút thư giãn đầu kiểu Ấn Độ và 45 phút massage giảm căng thẳng lưng.',
        offer4_inc1: 'Khuyến mãi áp dụng hàng ngày từ 10:00 sáng đến 8:00 tối.',
        offer4_con0: 'Các ưu đãi trên áp dụng từ bây giờ đến ngày 31 tháng 1 năm 2025.',
        offer4_con1: 'Không áp dụng cùng lúc với các ưu đãi/khuyến mãi khác.',

        // ── Offer 5 — Dine: Buffet ────────────────────────────
        offer5_title: 'Giảm 20% buffet hải sản cao cấp vào cuối tuần',
        offer5_desc: 'SOT cung cấp gói đặc biệt giảm 20% cho buffet hải sản cao cấp vào cuối tuần.',
        offer5_rate: 'Giá gốc: 969.000++ VND/người — Giá giảm 20%: 775.000++ VND/người',
        offer5_inc0: 'Buffet + nước ngọt & nước ép.',
        offer5_con0: 'Trẻ em từ 1m - 1m3: 50% giá người lớn.',
        offer5_con1: 'Liên hệ đặt chỗ vào mỗi Thứ Sáu và Thứ Bảy.',

        // ── Auth modals ───────────────────────────────────────
        modal_login_title: 'Chào mừng trở lại',
        modal_login_sub: 'Đăng nhập để truy cập đặt phòng sang trọng của bạn',
        modal_email_label: 'Địa chỉ Email',
        modal_pass_label: 'Mật khẩu',
        modal_pass_ph: 'Nhập mật khẩu của bạn',
        modal_remember: 'Ghi nhớ đăng nhập',
        modal_forgot: 'Quên mật khẩu?',
        modal_signin_btn: 'Đăng Nhập',
        modal_no_account: 'Chưa có tài khoản?',
        modal_create_link: 'Tạo tài khoản ngay',
        modal_register_title: 'Bắt Đầu Hành Trình',
        modal_register_sub: 'Tạo tài khoản để mở khóa các đặc quyền độc quyền',
        modal_name_label: 'Họ và tên',
        modal_phone_label: 'Số điện thoại',
        modal_pass2_label: 'Mật khẩu',
        modal_pass2_ph: 'Tối thiểu 6 ký tự',
        modal_create_btn: 'Tạo Tài Khoản',
        modal_have_account: 'Đã có tài khoản?',
        modal_signin_link: 'Đăng nhập tại đây',
        modal_forgot_title: 'Quên mật khẩu',
        modal_forgot_sub: 'Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu',
        modal_forgot_email_label: 'Địa chỉ Email',
        modal_forgot_submit_btn: 'Gửi Yêu Cầu',
        modal_forgot_remember: 'Đã nhớ mật khẩu?',
        modal_forgot_back_link: 'Quay lại đăng nhập',



        // ── Top bar profile ─────────────────────────────────────────────
        profile_welcome: 'Chào mừng,',
        profile_back: 'Quay về Trang Chủ',

        // ── Side bar profile ─────────────────────────────────────────────
        // (Admin)
        sidebar_overview: 'Tổng Quan',
        sidebar_dashboard: 'Bảng Điều Khiển',
        sidebar_managements: 'Quản Lý',
        sidebar_rooms: 'Quản lý Phòng',
        sidebar_bookings: 'Quản lý đặt Phòng',
        sidebar_users: 'Quản lý Người Dùng',
        sidebar_finances_feedback: 'Tài Chính & Phản Hồi',
        sidebar_payments: 'Quản lý Thanh Toán',
        sidebar_refundRequests: 'Yêu Cầu Hoàn Tiền',
        sidebar_reviews: 'Quản lý Đánh Giá',
        sidebar_livechat: 'Hỗ trợ Trực Tuyến',
        sidebar_logout: 'Đăng Xuất',

        // (Guest)
        sidebar_account: "Tài khoản của tôi",
        sidebar_bookings: "Đặt phòng của tôi",
        sidebar_rooms: "Duyệt phòng",
        sidebar_create_booking: "Tạo đặt phòng",
        sidebar_payments: "Thanh toán",
        sidebar_refunds: "Yêu cầu hoàn tiền",
        sidebar_reviews: "Đánh giá phòng",
        sidebar_signout: "Đăng xuất",

        
        
        // ── Admin overview ─────────────────────────────────────────────
        // ── Admin dashboard ─────────────────────────────────────────────
        admin_dashboard_title: 'Bảng Điều Khiển Quản Trị',
        admin_dashboard_sub: 'Quản lý hoạt động khu nghỉ dưỡng của bạn',
        admin_stat_users: 'Tổng Số Người Dùng',
        admin_stat_rooms: 'Tổng Số Phòng',
        admin_stat_bookings: 'Tổng Số Đặt Phòng',
        admin_stat_pending: 'Đang Chờ Xử Lý',
        admin_manage_rooms: 'Quản lý phòng',
        admin_manage_bookings: 'Quản lý đặt phòng',
        admin_manage_users: 'Quản lý người dùng',

        // ── Quản lý Phòng (Admin Rooms) ──────────────────────
        admin_rooms_title: 'Quản Lý Phòng',
        admin_rooms_sub: 'Thêm, sửa hoặc xóa các phòng trong hệ thống',
        admin_rooms_add_title: 'Thêm Phòng Mới',
        admin_rooms_label_name: 'Tên phòng',
        admin_rooms_label_capacity: 'Sức chứa',
        admin_rooms_label_status: 'Trạng thái',
        admin_rooms_status_available: 'CÓ SẴN',
        admin_rooms_status_booked: 'ĐÃ ĐẶT',
        admin_rooms_status_maintenance: 'BẢO TRÌ',
        admin_rooms_label_desc: 'Mô tả',
        admin_rooms_btn_add: 'Thêm Phòng',
        admin_rooms_list_title: 'Danh Sách Phòng',
        admin_rooms_col_id: 'Mã phòng',
        admin_rooms_col_name: 'Tên phòng',
        admin_rooms_col_capacity: 'Sức chứa',
        admin_rooms_col_status: 'Trạng thái',
        admin_rooms_col_action: 'Thao tác',

        // ── Quản lý Đặt phòng (Admin Bookings) ────────────────
        admin_bookings_title: 'Quản Lý Đặt Phòng',
        admin_bookings_sub: 'Xác nhận hoặc hủy yêu cầu đặt phòng của khách',
        admin_bookings_list_title: 'Danh Sách Đặt Phòng',
        admin_bookings_col_id: 'Mã đặt phòng',
        admin_bookings_col_guest: 'Khách hàng',
        admin_bookings_col_room: 'Phòng',
        admin_bookings_col_status: 'Trạng thái',
        admin_bookings_col_action: 'Thao tác',

        // ── Quản lý Người dùng (Admin Users) ──────────────────
        admin_users_title: 'Quản Lý Người Dùng',
        admin_users_sub: 'Xem và quản lý các tài khoản trong hệ thống',
        admin_users_list_title: 'Danh Sách Người Dùng',
        admin_users_col_id: 'Mã người dùng',
        admin_users_col_name: 'Họ và tên',
        admin_users_col_email: 'Email',
        admin_users_col_role: 'Vai trò',
        admin_users_btn_delete: 'Xóa',

        // ── Quản lý Thanh toán (Admin Payments) ───────────────
        admin_payments_title: 'Quản Lý Thanh Toán',
        admin_payments_sub: 'Theo dõi và xác minh các giao dịch của khách hàng',
        admin_total: 'Tổng số thanh toán',
        admin_pending: 'Đang chờ xử lý',
        admin_completed: 'Đã hoàn thành',
        admin_total_revenue: 'Tổng Doanh Thu',
        admin_payments_stat: 'Trạng thái',
        admin_stat_all: 'Tất cả',
        admin_stat_pending: ' Đang chờ xử lý',
        admin_stat_completed: 'Đã hoàn thành',
        admin_stat_failed: 'Thất bại',
        admin_payments_method: 'Phương thức',
        admind_method_all: 'Tất cả phương thức',
        admind_method_card: 'Thẻ',
        admind_method_bankTransfer: 'Chuyển khoản ngân hàng',
        admin_method_cash: 'Tiền mặt',
        admin_payments_search: 'Tìm kiếm',
        admin_payments_resetBtn: 'ĐẶT LẠI',
        admin_payments_col_all: 'Tất cả thanh toán',
        admin_payments_col_id: 'Mã thanh toán',
        admin_payments_col_booking: 'Mã đặt phòng',
        admin_payments_col_guest: 'Khách hàng',
        admin_payments_col_amount: 'Số tiền',
        admin_payments_col_method: 'Phương thức',
        admin_payments_col_status: 'Trạng thái',
        admin_payments_col_action: 'Hành động',
        admin_btn_approve: 'Chấp nhận',
        admin_btn_reject: 'Từ chối',

        // ── Yêu cầu Hoàn tiền (Admin Refunds) ─────────────────
        admin_refunds_title: 'Quản Lý Hoàn Tiền',
        admin_refunds_sub: 'Xử lý các yêu cầu hoàn tiền do hủy đặt phòng',
        admin_refunds_total_requests: 'Tổng số yêu cầu',
        admin_refunds_pending: 'Đang chờ xử lý',
        admin_refunds_approved: 'Đã chấp nhận',
        admin_refunds_rejected: 'Đã từ chối',
        admin_refunds_status: 'Trạng thái',
        admin_stat_all: 'Tất cả',
        admin_stat_pending: 'Đang chờ xử lý',
        admin_stat_approved: 'Đã chấp nhận',
        admin_stat_rejected: 'Đã từ chối',
        admin_refunds_search: 'Tìm kiếm',
        admin_refunds_resetBtn: 'ĐẶT LẠI',
        admin_refunds_col_all: 'Tất cả yêu cầu hoàn tiền',
        admin_refunds_col_id: 'Mã hoàn tiền',
        admin_refunds_col_guest: 'Khách hàng',
        admin_refunds_col_booking: 'Mã đặt phòng',
        admin_refunds_col_reason: 'Lý do',
        admin_refunds_col_status: 'Trạng thái',
        admin_refunds_col_action: 'Hành động',
        admin_actions_approved: 'Đã chấp nhận',
        admin_actions_rejected: 'Đã từ chối',
        admin_actions_delete: 'Xóa',

        // ── Quản lý Đánh giá (Admin Reviews) ──────────────────
        admin_reviews_title: 'Quản Lý Đánh Giá',
        admin_reviews_sub: 'Duyệt phản hồi và đánh giá của khách hàng',
        admin_reviews_total: 'Tổng số đánh giá',
        admin_reviews_avg_rating: 'Đánh giá trung bình',
        admin_reviews_published: 'Đã xuất bản',
        admin_reviews_hidden: 'Đã ẩn',
        admin_reviews_ratings_all: 'Tất cả xếp hạng',
        admin_reviews_stat_all: 'Tất cả',
        admin_reviews_stat_published: 'Đã xuất bản',
        admin_reviews_stat_hidden: 'Đã ẩn',
        admin_reviews_search: 'Tìm kiếm',
        admin_reviews_resetBtn: 'ĐẶT LẠI',
        admin_reviews_col_all: 'Tất cả đánh giá',
        admin_reviews_col_id: 'Mã đánh giá',
        admin_reviews_col_guest: 'Khách hàng',
        admin_reviews_col_booking: 'Mã đặt phòng',
        admin_reviews_col_rating: 'Xếp hạng',
        admin_reviews_col_content: 'Nội dung',
        admin_reviews_col_status: 'Trạng thái',
        admin_reviews_col_action: 'Hành động',
        admin_reviews_btn_hide: 'Ẩn',
        admin_reviews_table: 'Dạng bảng',
        admin_reviews_cards: 'Dạng thẻ',

        // ── Hỗ trợ Trực tuyến (Admin Live Chat) ───────────────
        admin_chat_title: 'Hỗ Trợ Trực Tuyến',
        admin_chat_search_ph: 'Tìm kiếm cuộc hội thoại...',
        admin_chat_no_conv: 'Không tìm thấy cuộc hội thoại nào',
        admin_chat_select_msg: 'Chọn một cuộc hội thoại để bắt đầu nhắn tin',
        admin_chat_input_ph: 'Nhập tin nhắn...',
        admin_chat_btn_resolve: 'Hoàn tất',


        // ── Guest dashboard ─────────────────────────────────────────────
        // ── Account Page ─────────────────────────────────────────────
        account_title: "Tài khoản của tôi",
        account_desc: "Quản lý thông tin cá nhân của bạn",
        personal_info: "Thông tin cá nhân",
        full_name: "Họ và Tên",
        email: "Email",
        phone: "Số điện thoại",
        role: "Vai trò",
        quick_actions: "Thao tác nhanh",
        quick_bookings: "Xem Đơn Đặt Phòng",
        quick_create_booking: "Tạo Đơn Đặt Phòng Mới",
        quick_payments: "Lịch Sử Thanh Toán",
        quick_refunds: "Yêu Cầu Hoàn Tiền",
        quick_reviews: "Đánh Giá Phòng",
        quick_rooms: "Xem Phòng",
        btn_edit_profile: "Chỉnh sửa thông tin",

        // ── Bookings Page ─────────────────────────────────────────────
        bookings_title: "Đơn đặt phòng của tôi",
        bookings_desc: "Xem và quản lý các lịch hẹn đặt phòng",
        table_room: "Phòng",
        table_checkin: "Ngày nhận phòng",
        table_checkout: "Ngày trả phòng",
        table_status: "Trạng thái",
        table_action: "Thao tác",
        btn_new_booking: "Tạo đơn đặt phòng mới",
        loading_bookings: "Đang tải danh sách...",

        // ── Create Booking Page ─────────────────────────────────────────────
        create_booking_title: "Tạo đơn đặt phòng",
        create_booking_desc: "Chọn phòng và thời gian lưu trú",
        booking_details: "Chi tiết đặt phòng",
        booking_sub: "Điền các thông tin dưới đây để giữ chỗ",
        label_branch: "Chi nhánh",
        label_room: "Loại phòng",
        label_note: "Ghi chú",
        label_checkin: "Ngày nhận phòng",
        label_checkout: "Ngày trả phòng",
        btn_confirm: "Xác nhận đặt phòng",
        btn_back_to_list: "Quay lại danh sách",
        placeholder_note: "Yêu cầu đặc biệt hoặc ghi chú thêm (tùy chọn)",

        // ── Rooms Page ─────────────────────────────────────────────
        rooms_title: "Danh sách phòng",
        rooms_desc: "Tìm phòng hoàn hảo cho kỳ nghỉ của bạn",
        filter_title: "Bộ lọc",
        filter_type: "Loại phòng",
        filter_type_all: "Tất cả loại",
        filter_capacity: "Sức chứa",
        filter_capacity_placeholder: "Số người",
        filter_price: "Mức giá",
        filter_price_all: "Tất cả mức giá",
        filter_price_1: "Dưới 500,000 VND",
        filter_price_2: "500,000 - 1,000,000 VND",
        filter_price_over: "Trên 1,000,000 VND",
        filter_rating: "Đánh giá",
        filter_rating_all: "Tất cả đánh giá",
        filter_rating_5: "5 sao",
        filter_rating_4: "4 sao trở lên",
        filter_rating_3: "3 sao trở lên",
        btn_reset: "Xóa tất cả bộ lọc",

        // ── Payments Page ─────────────────────────────────────────────
        payments_title: "Thanh toán",
        payments_desc: "Theo dõi và gửi hồ sơ thanh toán của bạn",
        payments_stat_total_pay: "Tổng lượt thanh toán",
        payments_stat_completed: "Hoàn tất",
        payments_stat_total_amount: "Tổng tiền đã trả",
        new_payment: "Thanh toán mới",
        label_booking: "Mã đặt phòng",
        label_method: "Phương thức",
        label_amount: "Số tiền",
        btn_submit_payment: "Gửi thanh toán",
        payments_col: "Thanh toán của tôi",
        payments_col_id: "Mã thanh toán",
        payments_col_booking: "Mã đặt phòng",
        payments_col_amount: "Số tiền",
        payments_col_method: "Phương thức",
        payments_col_status: "Trạng thái",

        // ── Refund Requests Page ─────────────────────────────────────────────
        refunds_title: "Yêu cầu hoàn tiền",
        refunds_desc: "Gửi và theo dõi các yêu cầu hoàn tiền",
        refund_info_banner: "Yêu cầu hoàn tiền sẽ được xem xét trong 3-5 ngày làm việc.",
        refunds_total: "Tổng số yêu cầu",
        refunds_pending: "Đang chờ",
        refunds_approved: "Đã được duyệt",
        refunds_new: "Yêu cầu hoàn tiền mới",
        refunds_select_booking: "Chọn đơn đặt phòng",
        label_reason: "Lý do hoàn tiền",
        placeholder_reason: "Vui lòng mô tả lý do bạn muốn hoàn tiền…",
        btn_submit_refund: "Gửi yêu cầu hoàn tiền",
        refunds_my_requests: "Các yêu cầu hoàn tiền của tôi",
        refunds_col_id: "Mã hoàn tiền",
        refunds_col_booking: "Đơn đặt phòng",
        refunds_col_reason: "Lý do",
        refunds_col_status: "Trạng thái",

        // ── Reviews Page ─────────────────────────────────────────────
        reviews_title: "Đánh giá phòng",
        reviews_desc: "Chia sẻ trải nghiệm và xem các đánh giá cũ của bạn",
        reviews_total: "Tổng số đánh giá",
        reviews_avg_rating: "Đánh giá trung bình",
        reviews_5star: "Số đánh giá 5 sao",
        write_review: "Viết đánh giá",
        reviews_select_booking: "Chọn đơn đặt phòng để đánh giá",
        label_rating: "Xếp hạng của bạn",
        label_review_content: "Đánh giá",
        placeholder_review: "Hãy chia sẻ về kỳ nghỉ của bạn…",
        btn_submit_review: "Gửi đánh giá",
        label_my_reviews: "Các đánh giá của tôi",
    }
};

// ─────────────────────────────────────────────────────────────
//  Core helpers
// ─────────────────────────────────────────────────────────────

/** Return current language ('en' or 'vi'), default 'en' */
function getLang() {
    return localStorage.getItem('sot_lang') || 'en';
}

/** Persist and apply a language */
function setLang(lang) {
    localStorage.setItem('sot_lang', lang);
    applyTranslations(lang);
    updateToggleButton(lang);
}

/** Walk the DOM and swap every [data-i18n] element */
function applyTranslations(lang) {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (!dict[key]) return;

        // Handle placeholder for inputs
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = dict[key];
        } else {
            el.textContent = dict[key];
        }
    });

    // Update html lang attribute
    document.documentElement.lang = lang;
}

/** Keep the toggle button label in sync */
function updateToggleButton(lang) {
    const btn = document.getElementById('lang-toggle-btn');
    if (!btn) return;
    // Show the OTHER language as the button label (what you'd switch TO)
    btn.setAttribute('data-current-lang', lang);
    btn.querySelector('.lang-label').textContent = lang === 'en' ? 'VI' : 'EN';
    btn.querySelector('.lang-flag').textContent = lang === 'en' ? '🇻🇳' : '🇬🇧';
    btn.title = lang === 'en' ? 'Chuyển sang Tiếng Việt' : 'Switch to English';
}

/** Toggle between EN and VI */
function toggleLanguage() {
    const newLang = getLang() === 'en' ? 'vi' : 'en';
    setLang(newLang);
}

// ─────────────────────────────────────────────────────────────
//  Boot
// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Expose globally so onclick="" attributes work
    window.toggleLanguage = toggleLanguage;

    // Apply stored preference immediately
    const lang = getLang();
    applyTranslations(lang);
    updateToggleButton(lang);
});