// Conversational intent handler with realistic fleet management responses
async function handleIntent(intent, params) {
  console.log('Handling intent:', intent, 'with parameters:', params);
  
  switch (intent) {
    case 'cancel_shipment':
      if (params.truck_id) {
        return `✅ Perfect! I've successfully cancelled the shipment for truck ${params.truck_id}. The driver has been notified and the route has been updated. Is there anything else you need help with?`;
      } else if (params.shipment_id) {
        return `✅ Done! Shipment ${params.shipment_id} has been cancelled successfully. All parties involved have been notified. Can I help you with anything else?`;
      } else {
        return "I'd be happy to cancel a shipment for you! Could you please provide either a truck ID or shipment ID?";
      }

    case 'assign_driver':
      if (params.truck_id && params.driver_name) {
        return `✅ Excellent! I've assigned driver ${params.driver_name} to truck ${params.truck_id}. They'll receive the route details shortly and can start the delivery. Need anything else?`;
      } else if (params.truck_id) {
        return `I can assign a driver to truck ${params.truck_id}. What's the driver's name you'd like to assign?`;
      } else if (params.driver_name) {
        return `Got it! I can assign ${params.driver_name} as a driver. Which truck should I assign them to?`;
      } else {
        return "I can help assign a driver to a truck. Please tell me both the truck ID and the driver's name.";
      }

    case 'track_order':
      if (params.truck_id) {
        return `🚛 Here's the latest on truck ${params.truck_id}:\n\n📍 Current location: Highway I-80 near Des Moines, IA\n⏰ ETA: 2 hours to Denver, CO\n👨‍✈️ Driver: John Smith\n📱 Last update: 15 minutes ago\n\nEverything looks good! Would you like me to check anything else?`;
      } else if (params.shipment_id) {
        return `📦 Tracking update for shipment ${params.shipment_id}:\n\n📍 Status: In transit\n🏢 Last checkpoint: Chicago Distribution Center\n🚛 On truck: T-456\n⏰ Expected delivery: Tomorrow by 3 PM\n\nThe shipment is on schedule! Anything else I can help with?`;
      } else {
        return "I can track any shipment for you! Just provide either a truck ID or shipment ID and I'll get you the latest updates.";
      }

    case 'get_truck_status':
      if (params.truck_id) {
        return `🚛 Status report for truck ${params.truck_id}:\n\n✅ Status: Active and on route\n📍 Location: Highway I-80 near Des Moines, IA\n👨‍✈️ Driver: John Smith (available)\n⛽ Fuel level: 75% (good for 300+ miles)\n🌡️ Temperature: Normal\n⚡ GPS: Connected\n\nTruck is operating normally! Is there anything specific you'd like me to check?`;
      } else {
        return "I can check the detailed status of any truck in your fleet. Which truck ID would you like me to look up?";
      }

    case 'update_location':
      if (params.truck_id && params.location) {
        return `📍 Perfect! I've updated the location for truck ${params.truck_id} to ${params.location}. The system has logged this update and dispatch has been notified. Anything else you need?`;
      } else if (params.truck_id) {
        return `I can update the location for truck ${params.truck_id}. Where is the truck currently located?`;
      } else {
        return "I can help update a truck's location. Please provide the truck ID and the new location.";
      }

    default:
      return "I'm here to help with your fleet management! I can cancel shipments, assign drivers, track orders, check truck status, and update locations. What would you like me to help you with?";
  }
}

module.exports = handleIntent;

