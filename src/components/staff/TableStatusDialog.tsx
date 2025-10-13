import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { useTableStore, TableStatus } from '@/store/tableStore';
import { toast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TableStatusDialogProps {
  tableId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TableStatusDialog = ({ tableId, open, onOpenChange }: TableStatusDialogProps) => {
  const table = useTableStore((state) => state.getTableById(tableId || ''));
  const updateTable = useTableStore((state) => state.updateTable);
  
  const [status, setStatus] = useState<TableStatus>(table?.status || 'available');
  const [reservationName, setReservationName] = useState(table?.reservationName || '');
  const [reservationDate, setReservationDate] = useState<Date | undefined>(
    table?.reservationStart ? new Date(table.reservationStart) : undefined
  );
  const [startTime, setStartTime] = useState(
    table?.reservationStart ? format(new Date(table.reservationStart), 'HH:mm') : ''
  );
  const [endTime, setEndTime] = useState(
    table?.reservationEnd ? format(new Date(table.reservationEnd), 'HH:mm') : ''
  );

  if (!table) return null;

  const handleSave = () => {
    const updates: Partial<typeof table> = { status };

    if (status === 'occupied' && reservationDate && startTime && endTime && reservationName) {
      // Save reservation details if table is occupied with a reservation
      const start = new Date(reservationDate);
      const [startHour, startMin] = startTime.split(':').map(Number);
      start.setHours(startHour, startMin);

      const end = new Date(reservationDate);
      const [endHour, endMin] = endTime.split(':').map(Number);
      end.setHours(endHour, endMin);

      updates.reservationStart = start.toISOString();
      updates.reservationEnd = end.toISOString();
      updates.reservationName = reservationName;
    } else if (status === 'available' || status === 'out_of_service') {
      // Clear reservation data when not occupied
      updates.reservationStart = undefined;
      updates.reservationEnd = undefined;
      updates.reservationName = undefined;
    }

    updateTable(table.id, updates);
    toast({
      title: 'Table Updated',
      description: `Table ${table.number} status changed to ${status}`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Table {table.number} Status</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Table Status</Label>
            <RadioGroup value={status} onValueChange={(v) => setStatus(v as TableStatus)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="available" id="available" />
                <Label htmlFor="available" className="font-normal cursor-pointer">
                  Available
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="occupied" id="occupied" />
                <Label htmlFor="occupied" className="font-normal cursor-pointer">
                  Occupied
                </Label>
              </div>
            </RadioGroup>
          </div>

          {status === 'occupied' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="reservationName">Guest/Reservation Name (Optional)</Label>
                <Input
                  id="reservationName"
                  value={reservationName}
                  onChange={(e) => setReservationName(e.target.value)}
                  placeholder="Customer name"
                />
              </div>

              <div className="space-y-2">
                <Label>Reservation Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !reservationDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {reservationDate ? format(reservationDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={reservationDate}
                      onSelect={setReservationDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
