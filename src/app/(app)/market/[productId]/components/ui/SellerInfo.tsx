import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";
import { SellerInfoProps } from "../types";

export default function SellerInfo({ seller, createdAt, mobileNumber, hostel }: SellerInfoProps) {
  if (!seller) return null;

  return (
    <Card className="mb-8 rounded-2xl border-white/10 bg-white/5 backdrop-blur-md shadow-lg overflow-hidden">
      <CardContent className="p-5">
        <h3 className="text-sm font-medium mb-4 text-muted-foreground">SELLER INFORMATION</h3>
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-14 w-14 rounded-2xl border-2 border-primary/20">
            <AvatarImage src={seller.image || ""} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {seller.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-lg">{seller.username}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <Calendar className="h-3 w-3" />
              <span>Listed on {format(new Date(createdAt), "MMMM d, yyyy")}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-3 mt-4">
          {mobileNumber && (
            <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <p>{mobileNumber}</p>
            </div>
          )}
          
          {hostel && (
            <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <p>{hostel}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 