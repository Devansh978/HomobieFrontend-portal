import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CreateTeamProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: TeamMemberInput) => void;
}

export interface TeamMemberInput {
  firstName: string;
  lastName: string;
  email: string;
  role: "telecaller" | "broker";
}

export const CreateTeam = ({ open, onOpenChange, onCreate }: CreateTeamProps) => {
  const { toast } = useToast();
  const [form, setForm] = useState<TeamMemberInput>({
    firstName: "",
    lastName: "",
    email: "",
    role: "telecaller",
  });

  const handleSubmit = () => {
    if (!form.firstName || !form.lastName || !form.email) {
      toast({ title: "Missing fields", description: "Please fill all fields." });
      return;
    }

    onCreate(form);
    onOpenChange(false);
    toast({ title: "Team member added", description: `${form.firstName} ${form.lastName} (${form.role})` });

    // Reset form
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      role: "telecaller",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="First Name"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          />
          <Input
            placeholder="Last Name"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />
          <Input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <Select
            value={form.role}
            onValueChange={(value) => setForm({ ...form, role: value as "telecaller" | "broker" })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="telecaller">Telecaller</SelectItem>
              <SelectItem value="broker">Broker</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Member</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
