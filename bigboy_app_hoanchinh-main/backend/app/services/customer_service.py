"""
Customer service - Auto update history and membership
"""
from app.infrastructure.databases import get_session
from app.models.customer_model import CustomerModel, MembershipTier
from app.models.customer_history_model import CustomerHistoryModel
from app.models.order_model import OrderModel, OrderStatus
from app.models.dish_model import DishSnapshotModel
from datetime import datetime


def update_customer_history_from_order(order_id, customer_id):
    """Update customer history when order is paid"""
    session = get_session()
    try:
        # Get order
        order = session.query(OrderModel).filter(OrderModel.id == order_id).first()
        if not order or order.status != OrderStatus.PAID:
            return
        
        # Get dish snapshot to get dish_id
        dish_snapshot = session.query(DishSnapshotModel).filter(
            DishSnapshotModel.id == order.dish_snapshot_id
        ).first()
        
        if not dish_snapshot:
            return
        
        # Check if history already exists for this order
        existing_history = session.query(CustomerHistoryModel).filter(
            CustomerHistoryModel.order_id == order_id
        ).first()
        
        if existing_history:
            return
        
        # Get or create history for this visit
        # Group orders by tenant and date
        history = session.query(CustomerHistoryModel).filter(
            CustomerHistoryModel.customer_id == customer_id,
            CustomerHistoryModel.tenant_id == order.tenant_id,
            CustomerHistoryModel.visit_date >= datetime.utcnow().replace(hour=0, minute=0, second=0)
        ).first()
        
        total_amount = dish_snapshot.price * order.quantity
        
        if history:
            # Update existing history
            if history.dish_ids:
                if dish_snapshot.dish_id not in history.dish_ids:
                    history.dish_ids.append(dish_snapshot.dish_id)
            else:
                history.dish_ids = [dish_snapshot.dish_id] if dish_snapshot.dish_id else []
            history.total_amount += total_amount
            history.order_id = order_id
        else:
            # Create new history
            history = CustomerHistoryModel(
                customer_id=customer_id,
                tenant_id=order.tenant_id,
                order_id=order_id,
                dish_ids=[dish_snapshot.dish_id] if dish_snapshot.dish_id else [],
                total_amount=total_amount,
                visit_date=order.created_at or datetime.utcnow()
            )
            session.add(history)
        
        # Update customer total spending
        customer = session.query(CustomerModel).filter(CustomerModel.id == customer_id).first()
        if customer:
            customer.total_spending += total_amount
            
            # Calculate points (1% of spending)
            points_earned = int(total_amount * 0.01)
            customer.points += points_earned
            
            # Update membership tier
            if customer.total_spending >= 10000000:
                customer.membership_tier = MembershipTier.DIAMOND
            elif customer.total_spending >= 5000000:
                customer.membership_tier = MembershipTier.GOLD
            elif customer.total_spending >= 1000000:
                customer.membership_tier = MembershipTier.SILVER
            else:
                customer.membership_tier = MembershipTier.IRON
        
        session.commit()
    except Exception as e:
        session.rollback()
        print(f"Error updating customer history: {e}")
    finally:
        session.close()

