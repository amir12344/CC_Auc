import { Package, DollarSign, MapPin, Tag, Truck, List } from 'lucide-react';

interface ProductMetricsProps {
  unitsInListing: string;
  avgPricePerUnit: string;
  minOrderValue: string;
  location: string;
  packaging: string;
  shipWindow: string;
}

// This component uses inline metrics rendering now instead of MetricCard

export const ProductMetrics = ({ 
  unitsInListing, 
  avgPricePerUnit, 
  minOrderValue, 
  location, 
  packaging, 
  shipWindow 
}: ProductMetricsProps) => {
  const metrics = [
    { 
      title: "Units in listing", 
      value: unitsInListing, 
      icon: <List className="h-4 w-4 text-gray-500" /> 
    },
    { 
      title: "Avg price/unit", 
      value: avgPricePerUnit, 
      icon: <Tag className="h-4 w-4 text-gray-500" /> 
    },
    { 
      title: "Min. Order Value", 
      value: minOrderValue, 
      icon: <DollarSign className="h-4 w-4 text-gray-500" /> 
    },
    { 
      title: "Location", 
      value: location, 
      icon: <MapPin className="h-4 w-4 text-gray-500" /> 
    },
    { 
      title: "Packaging", 
      value: packaging, 
      icon: <Package className="h-4 w-4 text-gray-500" /> 
    },
    { 
      title: "Ship window", 
      value: shipWindow, 
      icon: <Truck className="h-4 w-4 text-gray-500" /> 
    },
  ];

  return (
    <div className="py-6 border-t border-b border-gray-200">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <div key={metric.title} className="flex items-start gap-2">
            <div className="mt-0.5">{metric.icon}</div>
            <div>
              <div className="text-xs font-medium text-gray-500 mb-0.5">{metric.title}</div>
              <div className="text-sm font-semibold text-gray-900">{metric.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 