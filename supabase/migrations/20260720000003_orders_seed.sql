-- Seed mock orders if there are none
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM orders LIMIT 1) THEN
    -- Order 1
    INSERT INTO orders (email, phone, full_name, shipping_address, city, payment_method, payment_status, shipping_status, subtotal, discount, shipping_fee, total, created_at)
    VALUES 
    ('orxan@gmail.com', '+994 50 123 45 67', 'Orxan Məmmədov', 'Elmlər Akademiyası m. | Instagram: @orxan_m', 'Bakı', 'card_to_card', 'paid', 'delivered', 145.00, 0.00, 0.00, 145.00, NOW() - INTERVAL '1 day'),
    ('ayten@gmail.com', '+994 55 987 65 43', 'Aytən Əliyeva', 'Gənclik parkı yaxınlığı', 'Bakı', 'cash_on_delivery', 'pending', 'pending', 55.00, 5.00, 3.00, 53.00, NOW() - INTERVAL '2 days'),
    ('tural@mail.ru', '+994 70 555 44 33', 'Tural Süleymanov', '28 May metrosu çıxışı | Instagram: @tural_s', 'Bakı', 'card_to_card', 'paid', 'delivered', 220.00, 20.00, 0.00, 200.00, NOW() - INTERVAL '3 days'),
    ('leyla@box.az', '+994 50 444 33 22', 'Leyla Hüseynova', 'Nərimanov m. çıxışı', 'Bakı', 'cash_on_delivery', 'pending', 'pending', 45.00, 0.00, 0.00, 45.00, NOW() - INTERVAL '4 days'),
    ('farid@gmail.com', '+994 77 111 22 33', 'Fərid Qasımov', 'Xırdalan şəhəri, blok 4', 'Xırdalan', 'cash_on_delivery', 'pending', 'pending', 110.00, 0.00, 3.00, 113.00, NOW() - INTERVAL '5 days'),
    ('gunel@code.edu.az', '+994 50 888 77 66', 'Günel Həsənova', 'Sumqayıt 10-cu mkr | Instagram: @gunel_h', 'Sumqayıt', 'card_to_card', 'paid', 'delivered', 85.00, 0.00, 7.00, 92.00, NOW() - INTERVAL '6 days'),
    ('nihad@gmail.com', '+994 55 222 33 44', 'Nihad Əlizadə', 'İçərişəhər metrosu | Instagram: @nihad_a', 'Bakı', 'card_to_card', 'paid', 'delivered', 130.00, 10.00, 0.00, 120.00, NOW() - INTERVAL '8 days'),
    ('sebiner@gmail.com', '+994 50 333 44 55', 'Səbinə Rəhimova', 'Yasamal, İnşaatçılar pr.', 'Bakı', 'cash_on_delivery', 'pending', 'pending', 75.00, 0.00, 3.00, 78.00, NOW() - INTERVAL '12 days'),
    ('muradm@gmail.com', '+994 50 777 88 99', 'Murad Məmmədov', 'Xətai metrosu yaxınlığı', 'Bakı', 'card_to_card', 'paid', 'delivered', 260.00, 25.00, 0.00, 235.00, NOW() - INTERVAL '15 days'),
    ('elvin@mail.ru', '+994 70 999 88 11', 'Elvin Vəliyev', 'Badamdar qəsəbəsi', 'Bakı', 'cash_on_delivery', 'pending', 'shipped', 90.00, 0.00, 3.00, 93.00, NOW() - INTERVAL '18 days'),
    ('nigar@box.az', '+994 50 666 55 44', 'Nigar Baxşəliyeva', 'Sahil metrosu', 'Bakı', 'card_to_card', 'paid', 'delivered', 155.00, 15.00, 0.00, 140.00, NOW() - INTERVAL '22 days'),
    ('kenan@gmail.com', '+994 55 111 44 77', 'Kənan Əsgərov', 'Nəsimi r., 3-cü mkr', 'Bakı', 'cash_on_delivery', 'pending', 'pending', 60.00, 0.00, 3.00, 63.00, NOW() - INTERVAL '26 days'),
    ('ayxanr@gmail.com', '+994 50 500 11 22', 'Ayxan Rzayev', 'Koroğlu metrosu | Instagram: @ayxan_r', 'Bakı', 'card_to_card', 'paid', 'delivered', 195.00, 15.00, 0.00, 180.00, NOW() - INTERVAL '29 days');
  END IF;
END $$;
