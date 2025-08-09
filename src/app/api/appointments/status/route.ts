import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const appointmentsFile = path.join(process.cwd(), 'data', 'appointments.json');

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { appointmentId, status, action } = body;
    
    // Read existing appointments
    const data = fs.readFileSync(appointmentsFile, 'utf8');
    const appointments = JSON.parse(data);
    
    // Find and update the appointment
    let found = false;
    let updatedAppointment = null;
    Object.keys(appointments).forEach(dateKey => {
      if (Array.isArray(appointments[dateKey])) {
        appointments[dateKey] = appointments[dateKey].map((appointment: any) => {
          if (appointment.appointmentId === appointmentId) {
            found = true;
            updatedAppointment = { ...appointment, status };
            return updatedAppointment;
          }
          return appointment;
        });
      }
    });
    
    if (!found) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    
    // Save updated appointments
    fs.writeFileSync(appointmentsFile, JSON.stringify(appointments, null, 2));
    
    return NextResponse.json({ success: true, status, appointment: updatedAppointment });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update appointment status' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, appointmentId, selectedDate, selectedTime } = body;
    
    if (action === 'cancel') {
      // Read existing appointments
      const data = fs.readFileSync(appointmentsFile, 'utf8');
      const appointments = JSON.parse(data);
      
      // Remove the appointment from the system
      let found = false;
      Object.keys(appointments).forEach(dateKey => {
        if (Array.isArray(appointments[dateKey])) {
          const originalLength = appointments[dateKey].length;
          appointments[dateKey] = appointments[dateKey].filter((appointment: any) => {
            if (appointment.appointmentId === appointmentId) {
              found = true;
              return false; // Remove this appointment
            }
            return true;
          });
          
          // If array is now empty, remove the date key
          if (appointments[dateKey].length === 0) {
            delete appointments[dateKey];
          }
        }
      });
      
      // Make the time slot available again by removing it from booked slots
      const bookedSlotsFile = path.join(process.cwd(), 'data', 'booked-slots.json');
      if (fs.existsSync(bookedSlotsFile)) {
        const bookedData = fs.readFileSync(bookedSlotsFile, 'utf8');
        const bookedSlots = JSON.parse(bookedData);
        
        if (bookedSlots[selectedDate]) {
          bookedSlots[selectedDate] = bookedSlots[selectedDate].filter((time: string) => time !== selectedTime);
          
          // If no more booked slots for this date, remove the date key
          if (bookedSlots[selectedDate].length === 0) {
            delete bookedSlots[selectedDate];
          }
        }
        
        fs.writeFileSync(bookedSlotsFile, JSON.stringify(bookedSlots, null, 2));
      }
      
      // Save updated appointments
      fs.writeFileSync(appointmentsFile, JSON.stringify(appointments, null, 2));
      
      return NextResponse.json({ success: true, message: 'Appointment cancelled and time slot freed' });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
} 