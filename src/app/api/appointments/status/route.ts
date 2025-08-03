import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const appointmentsFile = path.join(process.cwd(), 'data', 'appointments.json');

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { appointmentId, status } = body;
    
    // Read existing appointments
    const data = fs.readFileSync(appointmentsFile, 'utf8');
    const appointments = JSON.parse(data);
    
    // Find and update the appointment
    let found = false;
    Object.keys(appointments).forEach(dateKey => {
      if (Array.isArray(appointments[dateKey])) {
        appointments[dateKey] = appointments[dateKey].map((appointment: any) => {
          if (appointment.appointmentId === appointmentId) {
            found = true;
            return { ...appointment, status };
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
    
    return NextResponse.json({ success: true, status });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update appointment status' }, { status: 500 });
  }
} 