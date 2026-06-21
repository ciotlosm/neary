/**
 * ScheduleBoardDialog - full-screen Today / Tomorrow scheduled departure board
 * for a station, opened from the "Today schedule" / "Tomorrow schedule" buttons
 * on a scheduled departure card.
 *
 *  - Today    : upcoming scheduled departures from this station (>= now).
 *  - Tomorrow : all of tomorrow's scheduled departures.
 *
 * Schedule-only (GTFS); no live GPS. Degrades gracefully when no schedule data.
 */

import type { FC } from 'react';
import { useMemo, useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, IconButton, Typography, Box, Avatar,
  ToggleButtonGroup, ToggleButton, List, ListItem, Stack, Divider,
} from '@mui/material';
import { Close as CloseIcon, Schedule as ScheduleIcon } from '@mui/icons-material';
import { useScheduleStore } from '../../../stores/scheduleStore';
import { useTripStore } from '../../../stores/tripStore';
import { useRouteStore } from '../../../stores/routeStore';
import { buildTripRouteMap } from '../../../utils/schedule/scheduleVehicleIntegration';
import { buildStationDepartureBoard, formatBoardTime } from '../../../utils/schedule/stationScheduleBoard';
import { minutesSinceMidnight } from '../../../utils/schedule/activeServiceUtils';

type BoardMode = 'today' | 'tomorrow';

interface ScheduleBoardDialogProps {
  open: boolean;
  initialMode: BoardMode;
  station: { stop_id: number; stop_name: string } | null;
  onClose: () => void;
}

export const ScheduleBoardDialog: FC<ScheduleBoardDialogProps> = ({ open, initialMode, station, onClose }) => {
  const [mode, setMode] = useState<BoardMode>(initialMode);
  const { scheduleData } = useScheduleStore();
  const { trips } = useTripStore();
  const { routes } = useRouteStore();

  // Sync the toggle to whichever button opened the dialog.
  useEffect(() => {
    if (open) setMode(initialMode);
  }, [open, initialMode]);

  const board = useMemo(() => {
    if (!open || !station) return [];
    const now = new Date();
    const tripRouteMap = buildTripRouteMap(trips);
    if (mode === 'today') {
      return buildStationDepartureBoard({
        scheduleData,
        tripRouteMap,
        stopId: station.stop_id,
        date: now,
        fromMinutes: minutesSinceMidnight(now),
        routes,
      });
    }
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 12, 0, 0);
    return buildStationDepartureBoard({
      scheduleData,
      tripRouteMap,
      stopId: station.stop_id,
      date: tomorrow,
      fromMinutes: null,
      routes,
    });
  }, [open, station, mode, scheduleData, trips, routes]);

  return (
    <Dialog open={open} onClose={onClose} fullScreen>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
          <ScheduleIcon color="primary" />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" component="div" noWrap>{station?.stop_name ?? 'Schedule'}</Typography>
            <Typography variant="caption" color="text.secondary">Scheduled departures</Typography>
          </Box>
        </Box>
        <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2 }}>
        <ToggleButtonGroup
          exclusive
          size="small"
          color="primary"
          value={mode}
          onChange={(_, v) => v && setMode(v)}
          sx={{ mb: 2 }}
        >
          <ToggleButton value="today">Today</ToggleButton>
          <ToggleButton value="tomorrow">Tomorrow</ToggleButton>
        </ToggleButtonGroup>

        {board.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 2 }}>
            {scheduleData
              ? mode === 'today'
                ? 'No more scheduled departures today.'
                : 'No scheduled departures tomorrow.'
              : 'Schedule data is not available.'}
          </Typography>
        ) : (
          <List dense disablePadding>
            {board.map((d, i) => (
              <ListItem key={`${d.tripId}-${i}`} sx={{ px: 0, py: 0.75 }} divider={i < board.length - 1}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
                  <Typography variant="subtitle1" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, minWidth: 56 }}>
                    {formatBoardTime(d.departureMinutes)}
                  </Typography>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: '0.9rem', fontWeight: 'bold', flexShrink: 0 }}>
                    {d.routeShortName}
                  </Avatar>
                  <Typography variant="body2" sx={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {d.headsign || 'Scheduled departure'}
                  </Typography>
                </Stack>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};
