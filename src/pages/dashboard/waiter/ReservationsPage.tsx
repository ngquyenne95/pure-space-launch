import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useTableStore } from '@/store/tableStore';
import { useReservationStore } from '@/store/reservationStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ReservationCarousel } from '@/components/receptionist/ReservationCarousel';
import { Users } from 'lucide-react';

const ReservationsPage = () => {
  const { user } = useAuthStore();
  const branchId = user?.branchId || '';
  const { getTablesByBranchAndFloor } = useTableStore();
  const { getReservationsByBranch } = useReservationStore();

  const floorMap = getTablesByBranchAndFloor(branchId);
  const allReservations = getReservationsByBranch(branchId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Reservations</h2>
        <Badge variant="secondary">
          {allReservations.length} Total Reservations
        </Badge>
      </div>

      <div className="space-y-6">
        {Array.from(floorMap.keys()).sort((a, b) => a - b).map((floor) => {
          const floorTables = (floorMap.get(floor) || [])
            .filter(t => t.status !== 'out_of_service')
            .sort((a, b) => a.number - b.number);
          
          if (floorTables.length === 0) return null;
          
          return (
            <div key={floor} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-lg px-4 py-2">
                  <h3 className="text-lg font-semibold text-primary">Floor {floor}</h3>
                </div>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {floorTables.map((table) => {
                  const tableReservations = allReservations.filter(
                    r => r.tableId === table.id && r.status === 'confirmed'
                  );

                  if (tableReservations.length === 0) return null;

                  return (
                    <Card key={table.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">Table {table.number}</CardTitle>
                          <div className="flex flex-col gap-2 items-end">
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
                              {tableReservations.length} Reservation{tableReservations.length !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>Capacity: {table.capacity} guests</span>
                        </div>
                        
                        <ReservationCarousel reservations={tableReservations} />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}

        {allReservations.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No reservations found
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ReservationsPage;
