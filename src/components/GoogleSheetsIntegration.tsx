
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { FileSpreadsheet, Send } from 'lucide-react';

const GoogleSheetsIntegration = () => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleDataChange = (field: string, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleSendToSheets = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!webhookUrl) {
      toast({
        title: "Error",
        description: "Please enter your Google Sheets webhook URL",
        variant: "destructive",
      });
      return;
    }

    if (!data.name || !data.email) {
      toast({
        title: "Error",
        description: "Please fill in at least name and email",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log("Sending data to Google Sheets:", data);

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
          source: "Sortie Unique Admin Dashboard"
        }),
      });

      toast({
        title: "Success",
        description: "Data sent to Google Sheets successfully! Check your spreadsheet to confirm.",
      });

      // Reset form
      setData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error("Error sending data to Google Sheets:", error);
      toast({
        title: "Error",
        description: "Failed to send data to Google Sheets. Please check the webhook URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Google Sheets Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook">Google Sheets Webhook URL</Label>
            <Input
              id="webhook"
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="Enter your Google Sheets webhook URL"
            />
            <p className="text-sm text-gray-600">
              Create a Google Apps Script webhook to receive data in your Google Sheet.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Send Data to Google Sheets</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendToSheets} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => handleDataChange('name', e.target.value)}
                placeholder="Enter name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => handleDataChange('email', e.target.value)}
                placeholder="Enter email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message (optional)</Label>
              <Input
                id="message"
                value={data.message}
                onChange={(e) => handleDataChange('message', e.target.value)}
                placeholder="Enter message"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-orange-600"
              disabled={isLoading}
            >
              <Send className="w-4 h-4 mr-2" />
              {isLoading ? 'Sending...' : 'Send to Google Sheets'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p><strong>1.</strong> Create a new Google Sheet</p>
          <p><strong>2.</strong> Go to Extensions → Apps Script</p>
          <p><strong>3.</strong> Create a new script and deploy it as a web app</p>
          <p><strong>4.</strong> Copy the webhook URL and paste it above</p>
          <p><strong>5.</strong> Use the form to send data directly to your sheet</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleSheetsIntegration;
