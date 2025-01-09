"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ConnectionFormProps {
  onAddRelation: (relativeUsername: string, relationType: string) => void;
  selectedMember: { 
    _id: string;
    firstName: string; 
    lastName: string;
    username: string;
  } | null;
}

export function ConnectionForm({
  onAddRelation,
  selectedMember,
}: ConnectionFormProps) {
  const [selectedRelation, setSelectedRelation] = useState<string>("");
  const [relativeUsername, setRelativeUsername] = useState<string>("");

  const relationshipTypes = [
    "father",
    "mother",
    "brother",
    "sister",
    "spouse",
    "daughter",
    "son",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!relativeUsername || !selectedRelation) {
      alert("Please select a relationship and enter a username.");
      return;
    }

    onAddRelation(relativeUsername, selectedRelation);
    setSelectedRelation("");
    setRelativeUsername("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Connection Request</CardTitle>
        {selectedMember && (
          <p className="text-sm text-gray-500">
            Adding relation to: {selectedMember.firstName} {selectedMember.lastName}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 geistSans">
          <div className="space-y-2">
            <Label htmlFor="relationship">Relationship Type</Label>
            <Select
              value={selectedRelation}
              onValueChange={setSelectedRelation}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                {relationshipTypes.map((type) => (
                  <SelectItem key={type} value={type} className="geistSans">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Enter username"
              value={relativeUsername}
              onChange={(e) => setRelativeUsername(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full">
            Send Connection Request
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
