import { DashboardLayout } from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const SettingsPage = () => {
  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>

      <div className="max-w-2xl space-y-8">
        <div className="stat-card">
          <h3 className="section-title">Hotel Information</h3>
          <div className="space-y-4">
            <div><Label>Hotel Name</Label><Input defaultValue="Famous Haven Hotel" /></div>
            <div><Label>Email</Label><Input defaultValue="info@grandhaven.com" /></div>
            <div><Label>Phone</Label><Input defaultValue="+1 555-0100" /></div>
            <div><Label>Address</Label><Input defaultValue="123 Hospitality Ave, Suite 100" /></div>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Save Changes</Button>
          </div>
        </div>

        <div className="stat-card">
          <h3 className="section-title">Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div><p className="font-medium text-foreground">Booking Confirmations</p><p className="text-sm text-muted-foreground">Email guests on booking</p></div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div><p className="font-medium text-foreground">Low Availability Alerts</p><p className="text-sm text-muted-foreground">Notify when rooms are scarce</p></div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div><p className="font-medium text-foreground">Daily Reports</p><p className="text-sm text-muted-foreground">Send daily occupancy summary</p></div>
              <Switch />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
