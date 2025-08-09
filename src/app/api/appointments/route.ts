import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { toUTC, createLocalDateTime, isDateInPast } from '@/lib/date';

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
    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Ensure appointments file exists
    if (!fs.existsSync(appointmentsFile)) {
      fs.writeFileSync(appointmentsFile, '{}');
    }
    
    const data = fs.readFileSync(appointmentsFile, 'utf8');
    const appointments = JSON.parse(data);
    
    // Clean up past appointments
    const cleanedAppointments = cleanPastAppointments(appointments);
    
    // Save cleaned appointments back to file
    fs.writeFileSync(appointmentsFile, JSON.stringify(cleanedAppointments, null, 2));
    
    console.log('GET /api/appointments returning:', cleanedAppointments);
    return NextResponse.json(cleanedAppointments);
  } catch (error) {
    console.error('Error in GET /api/appointments:', error);
    return NextResponse.json({ error: 'Failed to read appointments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appointmentId, selectedDate, selectedTime, fullName, phoneNumber, serviceType, confirmed } = body;
    
    console.log('POST /api/appointments received:', body);
    
    // Validate date is not in past
    if (isDateInPast(selectedDate)) {
      return NextResponse.json({ error: 'Cannot book appointment in the past' }, { status: 400 });
    }
    
    // Create UTC timestamp for the appointment
    const appointmentUtc = createLocalDateTime(selectedDate, selectedTime);
    const createdAtUtc = toUTC(new Date());
    
    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Ensure appointments file exists
    if (!fs.existsSync(appointmentsFile)) {
      fs.writeFileSync(appointmentsFile, '{}');
    }
    
    // Read existing appointments
    const data = fs.readFileSync(appointmentsFile, 'utf8');
    const appointments = JSON.parse(data);
    
    // Clean up past appointments first
    const cleanedAppointments = cleanPastAppointments(appointments);
    
    // Use date as key for organization
    const dateKey = selectedDate;
    
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
    
    // Create appointment object with UTC timestamps
    const appointmentData = {
      appointmentId,
      selectedDate, // Keep local date for organization
      selectedTime, // Keep local time for display
      appointmentUtc, // UTC timestamp for the actual appointment
      createdAtUtc, // UTC timestamp for when it was created
      fullName,
      phoneNumber,
      serviceType,
      confirmed,
      status: 'waiting'
    };
    
    // Add the appointment
    cleanedAppointments[dateKey].push(appointmentData);
    
    // Save to file
    fs.writeFileSync(appointmentsFile, JSON.stringify(cleanedAppointments, null, 2));
    
    console.log('Appointment saved successfully:', {
      appointmentId,
      selectedDate,
      selectedTime,
      fullName,
      appointmentUtc
    });
    
    return NextResponse.json({ 
      success: true, 
      appointmentId,
      appointment: appointmentData 
    });
  } catch (error) {
    console.error('Error saving appointment:', error);
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