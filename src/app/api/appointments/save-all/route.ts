import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const appointmentsFile = path.join(process.cwd(), 'data', 'appointments.json');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appointments } = body;
    
    // Group appointments by date
    const groupedAppointments: { [key: string]: any[] } = {};
    
    appointments.forEach((appointment: any) => {
      const dateKey = appointment.selectedDate;
      if (!groupedAppointments[dateKey]) {
        groupedAppointments[dateKey] = [];
      }
      
      // Remove selectedDate from the appointment object before saving
      const { selectedDate, ...appointmentData } = appointment;
      groupedAppointments[dateKey].push(appointmentData);
    });
    
    // Save to file
    fs.writeFileSync(appointmentsFile, JSON.stringify(groupedAppointments, null, 2));
    
    return NextResponse.json({ success: true, message: 'All appointments saved successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save appointments' }, { status: 500 });
  }
} 