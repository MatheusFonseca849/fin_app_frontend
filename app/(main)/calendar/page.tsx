'use client'

import { useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { mockExpenses, mockIncome } from '@/app/mock/expenses';
import { Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/pt-br';

const Calendar = () => {
    const calendarRef = useRef<FullCalendar>(null);

    const events = [
        ...mockExpenses.map((e) => ({
            title: `- R$ ${e.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} — ${e.description}`,
            start: e.date,
            color: '#d32f2f',
        })),
        ...mockIncome.map((i) => ({
            title: `+ R$ ${i.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} — ${i.description}`,
            start: i.date,
            color: '#388e3c',
        })),
    ];

    const handleDateChange = (value: Dayjs | null) => {
        if (value && calendarRef.current) {
            calendarRef.current.getApi().gotoDate(value.toDate());
        }
    };

    return (
        <div>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, p: 2 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
                    <DatePicker
                        label="Ir para data"
                        defaultValue={dayjs()}
                        onChange={handleDateChange}
                        slotProps={{ textField: { size: 'small' } }}
                    />
                </LocalizationProvider>
            </Box>
            <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView='dayGridMonth'
                events={events}
                locale='pt-br'
                fixedWeekCount={false}
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,dayGridWeek',
                }}
                buttonText={{
                    today: 'Hoje',
                    month: 'Mês',
                    week: 'Semana',
                }}
                height='auto'
            />
        </div>
    )
}

export default Calendar