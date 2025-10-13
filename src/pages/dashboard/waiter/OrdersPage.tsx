import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useOrderStore, Order } from '@/store/orderStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Plus, ChevronDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ManualOrderDialog } from '@/components/staff/ManualOrderDialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const OrdersPage = () => {
  const { user } = useAuthStore();
  const branchId = user?.branchId || 'branch-1';
  const { orders, updateOrderStatus } = useOrderStore();
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [addOrderlineDialogOpen, setAddOrderlineDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

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

  const handleComplete = (orderId: string) => {
    updateOrderStatus(orderId, 'completed');
    toast({ title: 'Order completed', description: 'Order has been served and ready for billing.' });
  };

  const handleAddOrderline = (orderId: string) => {
    setSelectedOrderId(orderId);
    setAddOrderlineDialogOpen(true);
  };

  const toggleOrderExpanded = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
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

  const renderOrderCard = (order: Order, showActions: boolean = true) => {
    const isExpanded = expandedOrders.has(order.id);

    return (
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
          <Collapsible open={isExpanded} onOpenChange={() => toggleOrderExpanded(order.id)}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-2">
                <span className="text-sm font-medium">
                  {order.orderLines.length} orderline{order.orderLines.length !== 1 ? 's' : ''}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-3 pt-2">
                {order.orderLines?.map((line, lineIdx) => (
                  <div key={line.id} className="space-y-2 p-3 bg-muted/50 rounded border">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        Line {lineIdx + 1} - {new Date(line.createdAt).toLocaleTimeString()}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        ${line.total.toFixed(2)}
                      </Badge>
                    </div>
                    {line.items?.map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{item.quantity}x {item.name}</span>
                          <span>${(item.quantity * item.price).toFixed(2)}</span>
                        </div>
                        {item.customizations && item.customizations.length > 0 && (
                          <div className="ml-4 text-xs text-muted-foreground space-y-0.5">
                            {item.customizations.map((custom, cIdx) => (
                              <div key={cIdx} className="flex justify-between">
                                <span>+ {custom.optionName}</span>
                                <span>+${custom.price.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {line.notes && (
                      <div className="text-xs text-muted-foreground italic border-t pt-2 mt-2">
                        Note: {line.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="pt-2 border-t">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>

          {showActions && (
            <div className="flex flex-wrap gap-2">
              {order.status === 'pending' && (
                <>
                  <Button className="flex-1" onClick={() => handleAcceptOrder(order.id)}>
                    <Check className="mr-2 h-4 w-4" />
                    Accept
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={() => handleRejectOrder(order.id)}>
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </>
              )}
              {(order.status === 'preparing' || order.status === 'ready') && (
                <>
                  <Button variant="outline" className="flex-1" onClick={() => handleAddOrderline(order.id)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Orderline
                  </Button>
                  <Button className="flex-1" onClick={() => handleComplete(order.id)}>
                    Complete
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
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

        <TabsContent value="pending" className="mt-4 space-y-4">
          {pendingOrders.map(order => renderOrderCard(order, true))}
          {pendingOrders.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No pending orders
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="active" className="mt-4 space-y-4">
          {activeOrders.map(order => renderOrderCard(order, true))}
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

      {selectedOrderId && (
        <ManualOrderDialog
          open={addOrderlineDialogOpen}
          onOpenChange={setAddOrderlineDialogOpen}
          branchId={branchId}
        />
      )}
    </div>
  );
};

export default OrdersPage;
