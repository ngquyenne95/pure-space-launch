import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useOrderStore } from '@/store/orderStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Eye, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ManualOrderDialog } from '@/components/staff/ManualOrderDialog';

const OrdersPage = () => {
  const { user } = useAuthStore();
  const branchId = user?.branchId || 'branch-1';
  const { orders, updateOrderStatus } = useOrderStore();
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const branchOrders = orders?.filter(o => o.branchId === branchId) || [];
  const pendingOrders = branchOrders.filter(o => o.status === 'pending');
  const activeOrders = branchOrders.filter(o => ['preparing', 'ready'].includes(o.status));

  const handleAcceptOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'preparing');
    toast({ title: 'Order accepted', description: 'Order is now being prepared.' });
  };

  const handleRejectOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'cancelled');
    toast({ title: 'Order rejected', description: 'Order has been cancelled.' });
  };

  // Mark Ready removed per requirements

  const handleComplete = (orderId: string) => {
    updateOrderStatus(orderId, 'completed');
    toast({ title: 'Order completed', description: 'Order has been served.' });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'secondary',
      preparing: 'default',
      ready: 'default',
      completed: 'default',
      cancelled: 'destructive',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Order Management</h2>
        <Button onClick={() => setOrderDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Order
        </Button>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeOrders.length})</TabsTrigger>
        </TabsList>

        {/* PENDING ORDERS */}
        <TabsContent value="pending" className="mt-4 space-y-4">
          {pendingOrders.map(order => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    Order #{order.id} - Table {order.tableNumber}
                  </CardTitle>
                  {getStatusBadge(order.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {order.orderLines?.map((line, lineIdx) => (
                    <div key={line.id} className="space-y-2 p-2 bg-muted/30 rounded">
                      <div className="text-xs text-muted-foreground">
                        Line {lineIdx + 1} - {new Date(line.createdAt).toLocaleTimeString()}
                      </div>
                      {line.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.name}</span>
                          <span>${(item.quantity * item.price).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => handleAcceptOrder(order.id)}>
                    <Check className="mr-2 h-4 w-4" />
                    Accept
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={() => handleRejectOrder(order.id)}>
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {pendingOrders.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No pending orders
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ACTIVE ORDERS */}
        <TabsContent value="active" className="mt-4 space-y-4">
          {activeOrders.map(order => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    Order #{order.id} - Table {order.tableNumber}
                  </CardTitle>
                  {getStatusBadge(order.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {order.orderLines?.map((line, lineIdx) => (
                    <div key={line.id} className="space-y-2 p-2 bg-muted/30 rounded">
                      <div className="text-xs text-muted-foreground">
                        Line {lineIdx + 1} - {new Date(line.createdAt).toLocaleTimeString()}
                      </div>
                      {line.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.name}</span>
                          <span>${(item.quantity * item.price).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {order.status === 'ready' && (
                    <Button className="flex-1" onClick={() => handleComplete(order.id)}>
                      Complete
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setSelectedOrder(order.id)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {activeOrders.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No active orders
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <ManualOrderDialog
        open={orderDialogOpen}
        onOpenChange={setOrderDialogOpen}
        branchId={branchId}
      />
    </div>
  );
};

export default OrdersPage;
