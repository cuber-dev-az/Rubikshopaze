export interface ApplicationDictionary {
  navigation: {
    home: string;
    cart: string;
    admin: string;
  };
  product: {
    add_to_cart: string;
    out_of_stock: string;
    price: string;
  };
  cart: {
    title: string;
    empty: string;
    total: string;
    checkout: string;
    quantity: string;
  };
  checkout: {
    title: string;
    name: string;
    phone: string;
    instagram: string;
    address: string;
    submit_whatsapp: string;
    submit_instagram: string;
    processing: string;
  };
  admin: {
    dashboard: string;
    orders: string;
    status_pending: string;
    status_completed: string;
    login: string;
  };
}
