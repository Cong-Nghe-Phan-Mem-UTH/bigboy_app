import { create } from 'zustand';

export const useCartStore = create((set) => ({
  items: [],
  restaurantId: null,
  restaurantName: null,

  // Add item to cart
  addItem: (dish, quantity = 1, notes = '') => {
    set((state) => {
      const existingItem = state.items.find(
        (item) => item.dish_id === dish.id && item.notes === notes
      );

      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.dish_id === dish.id && item.notes === notes
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }

      return {
        items: [
          ...state.items,
          {
            dish_id: dish.id,
            dish_name: dish.name,
            dish_price: dish.price,
            quantity,
            notes,
            dish_image: dish.image || dish.image_url,
          },
        ],
        restaurantId: dish.restaurant_id || state.restaurantId,
        restaurantName: dish.restaurant_name || state.restaurantName,
      };
    });
  },

  // Remove item from cart
  removeItem: (dishId, notes = '') => {
    set((state) => ({
      items: state.items.filter(
        (item) => !(item.dish_id === dishId && item.notes === notes)
      ),
    }));
  },

  // Update item quantity
  updateQuantity: (dishId, quantity, notes = '') => {
    set((state) => ({
      items: state.items.map((item) =>
        item.dish_id === dishId && item.notes === notes
          ? { ...item, quantity: Math.max(0, quantity) }
          : item
      ).filter((item) => item.quantity > 0),
    }));
  },

  // Clear cart
  clearCart: () => {
    set({ items: [], restaurantId: null, restaurantName: null });
  },

  // Get total price
  getTotal: () => {
    return useCartStore.getState().items.reduce(
      (total, item) => total + item.dish_price * item.quantity,
      0
    );
  },

  // Get total items count
  getTotalItems: () => {
    return useCartStore.getState().items.reduce(
      (total, item) => total + item.quantity,
      0
    );
  },
}));

