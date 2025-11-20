"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ImageDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSetImage: (url: string) => void;
};

export const ImageDialog = ({
  isOpen,
  onClose,
  onSetImage,
}: ImageDialogProps) => {
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleSave = () => {
    if (url) {
      onSetImage(url);
    } else if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === "string") {
          onSetImage(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      setUrl("");
      setFile(null);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Image</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="url">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url">From URL</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
          </TabsList>
          <TabsContent value="url">
            <div className="py-4">
              <Label htmlFor="url">Image URL</Label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/image.png"
              />
            </div>
          </TabsContent>
          <TabsContent value="upload">
            <div className="py-4">
              <Label htmlFor="file">Upload from computer</Label>
              <Input id="file" type="file" onChange={handleFileChange} accept="image/*" />
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
