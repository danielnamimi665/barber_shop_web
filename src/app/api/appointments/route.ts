import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const appointmentsFile = path.join(dataDir, 'appointments.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize appointments file if it doesn't exist
if (!fs.existsSync(appointmentsFile)) {
  fs.writeFileSync(appointmentsFile, '{}');
}

// Helper function to clean up past appointments
function cleanPastAppointments(appointments: any) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  Object.keys(appointments).forEach(dateKey => {
    if (Array.isArray(appointments[dateKey])) {
      // Remove appointments from past dates
      const date = new Date(dateKey);
      if (date < today) {
        delete appointments[dateKey];
        return;
      }
      
      // Remove past time slots from today
      if (date.getTime() === today.getTime()) {
        appointments[dateKey] = appointments[dateKey].filter((appointment: any) => {
          const [hours, minutes] = appointment.selectedTime.split(':').map(Number);
          const appointmentTime = new Date();
          appointmentTime.setHours(hours, minutes, 0, 0);
          return appointmentTime > new Date();
        });
        
        // Remove the date key if no appointments remain
        if (appointments[dateKey].length === 0) {
          delete appointments[dateKey];
        }
      }
    }
  });
  
  return appointments;
}

export async function GET() {
  try {
    const data = fs.readFileSync(appointmentsFile, 'utf8');
    const appointments = JSON.parse(data);
    
    // Clean up past appointments
    const cleanedAppointments = cleanPastAppointments(appointments);
    
    // Save cleaned appointments back to file
    fs.writeFileSync(appointmentsFile, JSON.stringify(cleanedAppointments, null, 2));
    
    return NextResponse.json(cleanedAppointments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read appointments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appointmentId, selectedDate, selectedTime, fullName, phoneNumber, serviceType, confirmed, timestamp } = body;
    
    // Read existing appointments
    const data = fs.readFileSync(appointmentsFile, 'utf8');
    const appointments = JSON.parse(data);
    
    // Clean up past appointments first
    const cleanedAppointments = cleanPastAppointments(appointments);
    
    // Add new appointment
    const dateKey = new Date(selectedDate).toISOString().split('T')[0];
    
    if (!cleanedAppointments[dateKey]) {
      cleanedAppointments[dateKey] = [];
    }
    
    // Check if time slot is already occupied
    const isTimeSlotOccupied = cleanedAppointments[dateKey].some((appointment: any) => 
      appointment.selectedTime === selectedTime
    );
    
    if (isTimeSlotOccupied) {
      return NextResponse.json({ error: 'Time slot already occupied' }, { status: 409 });
    }
    
    // Add the appointment
    cleanedAppointments[dateKey].push({
      appointmentId,
      selectedTime,
      fullName,
      phoneNumber,
      serviceType,
      confirmed,
      timestamp,
      status: 'waiting', // Default status
      selectedDate: dateKey // Store the correct date
    });
    
    // Save to file
    fs.writeFileSync(appointmentsFile, JSON.stringify(cleanedAppointments, null, 2));
    
    return NextResponse.json({ success: true, appointmentId });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save appointment' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const data = fs.readFileSync(appointmentsFile, 'utf8');
    const appointments = JSON.parse(data);
    
    // Clean up past appointments
    const cleanedAppointments = cleanPastAppointments(appointments);
    
    // Remove cancelled appointments
    Object.keys(cleanedAppointments).forEach(dateKey => {
      if (Array.isArray(cleanedAppointments[dateKey])) {
        cleanedAppointments[dateKey] = cleanedAppointments[dateKey].filter((appointment: any) => 
          appointment.status !== 'cancelled'
        );
        
        // Remove the date key if no appointments remain
        if (cleanedAppointments[dateKey].length === 0) {
          delete cleanedAppointments[dateKey];
        }
      }
    });
    
    // Save cleaned appointments back to file
    fs.writeFileSync(appointmentsFile, JSON.stringify(cleanedAppointments, null, 2));
    
    return NextResponse.json({ success: true, message: 'Cancelled appointments removed' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to clean appointments' }, { status: 500 });
  }
} 