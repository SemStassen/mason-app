// import { Button } from "@mason/ui/button";
// import { Icons } from "@mason/ui/icons";
// import { uiStore } from "~/stores/ui-store";

// import { Badge } from "@mason/ui/badge";
// import { Calendar } from "@mason/ui/calendar";
// import {
//   DropdownMenu,
//   DropdownMenuCheckboxItem,
//   DropdownMenuContent,
//   DropdownMenuPortal,
//   DropdownMenuSub,
//   DropdownMenuSubContent,
//   DropdownMenuSubTrigger,
//   DropdownMenuTrigger,
// } from "@mason/ui/dropdown";
// import { Hotkey } from "@mason/ui/hotkey";
// import { Popover, PopoverContent, PopoverTrigger } from "@mason/ui/popover";
// import { Tooltip, TooltipContent, TooltipTrigger } from "@mason/ui/tooltip";
// import { cn } from "@mason/ui/utils";
// import {
//   addDays,
//   differenceInDays,
//   format,
//   isSameDay,
//   previousMonday,
//   subDays,
// } from "date-fns";
// import { observer } from "mobx-react-lite";
// import { useEffect, useRef } from "react";
// import { useHotkeys } from "react-hotkeys-hook";
// import { HOTKEYS } from "~/lib/constants/hotkeys";
// import { formatters, getDayProgressPercentage } from "~/lib/utils/dates";

// const getNavigationText = (
//   daysInView: number,
//   direction: "previous" | "next",
// ) => {
//   if (daysInView === 7) return `Go to ${direction} week`;
//   if (daysInView === 1) return `Go to ${direction} day`;
//   return `Go to ${direction} ${daysInView} days`;
// };

// const TrackerNavigation = observer(() => {
//   const trackerStore = uiStore.tracker;

//   useHotkeys(HOTKEYS.tracker.goToNext.key, () =>
//     trackerStore.setDateInView(
//       addDays(trackerStore.dateInView, trackerStore.daysInView),
//     ),
//   );
//   useHotkeys(HOTKEYS.tracker.goToPrevious.key, () =>
//     trackerStore.setDateInView(
//       subDays(trackerStore.dateInView, trackerStore.daysInView),
//     ),
//   );

//   return (
//     <div
//       className="flex flex-1 items-center gap-1.5 transition-[margin]"
//       style={{
//         marginLeft: uiStore.isSidebarOpen ? 0 : 48,
//         marginRight: uiStore.isSidebarOpen ? 48 : 0,
//       }}
//     >
//       <Popover>
//         <PopoverTrigger asChild>
//           <span>
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Button variant="ghost" size="sm" className="gap-1">
//                   <span>Mar</span>
//                   <span className="text-contrast-75">/</span>
//                   <span>Apr</span>
//                   <span className="text-contrast-60">
//                     {uiStore.tracker.dateInView.getFullYear()}
//                   </span>
//                 </Button>
//               </TooltipTrigger>
//               <TooltipContent>Change date</TooltipContent>
//             </Tooltip>
//           </span>
//         </PopoverTrigger>
//         <PopoverContent className="w-auto p-0" align="start">
//           <Calendar />
//         </PopoverContent>
//       </Popover>
//       <Tooltip>
//         <TooltipTrigger asChild>
//           <Badge variant="contrast">W22</Badge>
//         </TooltipTrigger>
//         <TooltipContent>Week 22 CHANGE</TooltipContent>
//       </Tooltip>
//       <Tooltip>
//         <TooltipTrigger asChild>
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={() =>
//               trackerStore.setDateInView(
//                 subDays(trackerStore.dateInView, trackerStore.daysInView),
//               )
//             }
//           >
//             <Icons.ChevronLeft />
//           </Button>
//         </TooltipTrigger>
//         <TooltipContent>
//           {getNavigationText(trackerStore.daysInView, "previous")}{" "}
//           <Hotkey>←</Hotkey>
//         </TooltipContent>
//       </Tooltip>
//       <Tooltip>
//         <TooltipTrigger>
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={() =>
//               trackerStore.setDateInView(
//                 addDays(trackerStore.dateInView, trackerStore.daysInView),
//               )
//             }
//           >
//             <Icons.ChevronRight />
//           </Button>
//         </TooltipTrigger>
//         <TooltipContent>
//           {getNavigationText(trackerStore.daysInView, "next")}{" "}
//           <Hotkey>→</Hotkey>
//         </TooltipContent>
//       </Tooltip>
//       {/* TODO: Add an animation to this */}
//       {/* {!isSameDay(dateInView, currentDate) && (
//   <Button
//     variant="ghost"
//     size="icon"
//     className="w-auto"
//     onClick={() => setDateInView(currentDate)}
//   >
//     Today
//   </Button>
// )} */}
//     </div>
//   );
// });

// const TrackerHeader = observer(() => {
//   const trackerStore = uiStore.tracker;

//   return (
//     <header className="flex h-11 shrink-0 items-center justify-between border-b px-3">
//       <div className="flex flex-1 items-center justify-end gap-2">
//         {/* <Badge variant="outline">Personal</Badge> */}
//         <TrackerNavigation />
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <span>
//               <Tooltip>
//                 <TooltipTrigger asChild>
//                   <Button size="icon" variant="ghost">
//                     <Icons.DotsThreeHorizontal />
//                   </Button>
//                 </TooltipTrigger>
//                 <TooltipContent collisionPadding={{ right: 12 }}>
//                   Open options
//                 </TooltipContent>
//               </Tooltip>
//             </span>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent collisionPadding={{ right: 12 }}>
//             <DropdownMenuCheckboxItem
//               checked={trackerStore.daysInView === 1}
//               onCheckedChange={() => trackerStore.setDaysInView(1)}
//             >
//               Day view
//             </DropdownMenuCheckboxItem>
//             <DropdownMenuCheckboxItem
//               checked={trackerStore.daysInView === 7}
//               onCheckedChange={() => trackerStore.setDaysInView(7)}
//             >
//               Week view
//             </DropdownMenuCheckboxItem>
//             <DropdownMenuSub>
//               <DropdownMenuSubTrigger className="ps-8">
//                 Show number of days
//               </DropdownMenuSubTrigger>
//               <DropdownMenuPortal>
//                 <DropdownMenuSubContent>
//                   <DropdownMenuCheckboxItem
//                     checked={trackerStore.daysInView === 2}
//                     onCheckedChange={() => trackerStore.setDaysInView(2)}
//                   >
//                     2 days
//                   </DropdownMenuCheckboxItem>
//                   <DropdownMenuCheckboxItem
//                     checked={trackerStore.daysInView === 3}
//                     onCheckedChange={() => trackerStore.setDaysInView(3)}
//                   >
//                     3 days
//                   </DropdownMenuCheckboxItem>
//                   <DropdownMenuCheckboxItem
//                     checked={trackerStore.daysInView === 4}
//                     onCheckedChange={() => trackerStore.setDaysInView(4)}
//                   >
//                     4 days
//                   </DropdownMenuCheckboxItem>
//                   <DropdownMenuCheckboxItem
//                     checked={trackerStore.daysInView === 5}
//                     onCheckedChange={() => trackerStore.setDaysInView(5)}
//                   >
//                     5 days
//                   </DropdownMenuCheckboxItem>
//                   <DropdownMenuCheckboxItem
//                     checked={trackerStore.daysInView === 6}
//                     onCheckedChange={() => trackerStore.setDaysInView(6)}
//                   >
//                     6 days
//                   </DropdownMenuCheckboxItem>
//                 </DropdownMenuSubContent>
//               </DropdownMenuPortal>
//             </DropdownMenuSub>
//           </DropdownMenuContent>
//         </DropdownMenu>
//       </div>
//     </header>
//   );
// });

// const SCROLL_SNAP_BUFFER = 7;
// const VISIBLE_DAYS_BUFFER_MULTIPLIER = 1;

// const TrackerCalendar = observer(() => {
//   const scrollContainerRef = useRef<HTMLDivElement>(null);

//   const trackerStore = uiStore.tracker;

//   const daysInViewOffset =
//     (trackerStore.daysInView * VISIBLE_DAYS_BUFFER_MULTIPLIER) / 2 -
//     trackerStore.daysInView;
//   const dayWidth = 100 / SCROLL_SNAP_BUFFER / trackerStore.daysInView;
//   const dayOffsetToStartOfWeek = differenceInDays(
//     previousMonday(trackerStore.currentDate),
//     trackerStore.currentDate,
//   );

//   useEffect(() => {
//     if (scrollContainerRef.current) {
//       const scrollWidth = scrollContainerRef.current.scrollWidth;
//       scrollContainerRef.current.scrollLeft = scrollWidth * 0.5;
//     }
//   }, [trackerStore.daysInView]);

//   return (
//     <div
//       ref={scrollContainerRef}
//       className="h-full snap-x snap-mandatory scroll-ps-16 overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
//     >
//       <div
//         className="relative isolate"
//         style={{
//           width: `calc(${SCROLL_SNAP_BUFFER} * (100% - 62px))`,
//         }}
//       >
//         {/**
//          * DAY SCROLL SNAPPING
//          */}
//         <div className="absolute inset-0 ml-16 grid auto-cols-fr grid-flow-col [&_>_*]:snap-start">
//           {Array.from({
//             length: SCROLL_SNAP_BUFFER * trackerStore.daysInView,
//           }).map((_, index) => {
//             // biome-ignore lint/suspicious/noArrayIndexKey: not dynamic
//             return <div key={index} />;
//           })}
//         </div>
//         {/**
//          * TOPBAR
//          */}
//         <div className="sticky inset-0 top-0 z-20">
//           {/**
//            * TIMEZONE
//            */}
//           <div className="sticky left-0 z-30 size-0">
//             <div className="flex h-10 w-16 items-center gap-2 border-muted border-r bg-background px-2">
//               <div className="text-xs">
//                 {new Date()
//                   .toLocaleDateString(undefined, {
//                     day: "2-digit",
//                     timeZoneName: "short",
//                   })
//                   .substring(4)}
//               </div>
//             </div>
//           </div>
//           {/**
//            * DAYS
//            */}
//           <div className="relative ml-16 h-[40px] overflow-hidden border-muted border-b bg-background">
//             {Array.from({
//               length: VISIBLE_DAYS_BUFFER_MULTIPLIER * trackerStore.daysInView,
//             }).map((_, index) => {
//               const currentDay = addDays(
//                 uiStore.tracker.dateInView,
//                 index - daysInViewOffset,
//               );
//               return (
//                 <div
//                   // biome-ignore lint/suspicious/noArrayIndexKey: count won't change
//                   key={index}
//                   className="absolute top-0 flex h-full items-center justify-center"
//                   style={{
//                     width: `${dayWidth}%`,
//                     left: `${
//                       50 + // Starts from center of container (50%)
//                       (index - dayOffsetToStartOfWeek) * // Adjusts for day position relative to start of week
//                         dayWidth - // Multiplies by width of each day cell
//                       dayWidth * daysInViewOffset // Shifts everything left by half the total view width
//                     }%`,
//                   }}
//                 >
//                   {format(currentDay, "EEE")}
//                   <span
//                     className={cn(
//                       "ml-1",
//                       isSameDay(currentDay, trackerStore.currentDate) &&
//                         "flex h-7 w-7 items-center justify-center rounded-md bg-primary text-white",
//                     )}
//                   >
//                     {format(currentDay, "dd")}
//                   </span>
//                 </div>
//               );
//             })}
//           </div>
//           {/**
//            * ALL DAY EVENTS (TOP)
//            */}
//           <div className="h-6">
//             <div className="sticky left-0 size-0">
//               <div className="h-6 w-screen border-muted border-y bg-background" />
//             </div>
//             <div className="sticky left-0 z-20 size-0">
//               <div className="flex h-6 w-16 justify-end border-muted border-y border-r bg-background px-2 text-xs">
//                 <div className="flex items-center">all-day</div>
//               </div>
//             </div>
//             {/**
//              * This will probably require different positioning then normal events
//              */}
//             <div className="relative ml-16 overflow-hidden">
//               {Array.from({
//                 length:
//                   VISIBLE_DAYS_BUFFER_MULTIPLIER * trackerStore.daysInView,
//               }).map((_, index) => {
//                 return (
//                   <div
//                     // biome-ignore lint/suspicious/noArrayIndexKey: count won't change
//                     key={index}
//                     className="absolute top-0 flex h-full items-center justify-center"
//                     style={{
//                       width: `${dayWidth}%`,
//                       left: `${
//                         50 + // Starts from center of container (50%)
//                         (index - dayOffsetToStartOfWeek) * // Adjusts for day position relative to start of week
//                           dayWidth - // Multiplies by width of each day cell
//                         dayWidth * daysInViewOffset // Shifts everything left by half the total view width
//                       }%`,
//                     }}
//                   />
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//         {/**
//          * CURRENT TIME MARKER (LINE)
//          */}
//         <div className="pointer-events-none sticky left-0 z-10 size-0">
//           <div className="relative h-[300vh]">
//             <div
//               className="absolute h-px w-screen bg-red-400/60 transition-[top,opacity]"
//               style={{
//                 top: `${getDayProgressPercentage(trackerStore.currentDate) - 0.05}%`,
//               }}
//             />
//           </div>
//         </div>
//         {/* HOURS (ON THE LEFT) */}
//         <div className="sticky left-0 z-10 size-0">
//           <div className="relative flex h-[300vh] w-16 flex-col border-muted border-r bg-background">
//             {Array.from({ length: 24 }).map((_, index) => {
//               if (index === 0) {
//                 return;
//               }

//               return (
//                 <div
//                   // biome-ignore lint/suspicious/noArrayIndexKey: not dynamic
//                   key={index}
//                   className="-translate-y-1/2 absolute inset-x-0"
//                   style={{
//                     top: `calc(calc(100% / 24) * ${index})`,
//                   }}
//                 >
//                   <div className="grow text-center text-muted-foreground text-xs">
//                     {formatters.time(new Date(0, 0, 0, index))}
//                   </div>
//                 </div>
//               );
//             })}
//             {/**
//              * CURRENT TIME STAMP
//              */}
//             <div
//               className="-translate-y-1/2 absolute inset-x-0"
//               style={{
//                 top: `${getDayProgressPercentage(trackerStore.currentDate)}%`,
//               }}
//             >
//               <div className="grow text-center text-red-400 text-xs">
//                 {formatters.time(trackerStore.currentDate)}
//               </div>
//             </div>
//           </div>
//         </div>

//         <div
//           className="relative ml-16 h-[300vh] overflow-hidden"
//           style={{
//             backgroundSize: "100% calc(100% / 24)",
//             backgroundImage:
//               "linear-gradient(to bottom, var(--color-popover) 1px, transparent 1px), repeating-linear-gradient(transparent, transparent calc(calc(100% / 4) - 2px), var(--color-popover) calc(100% / 4))",
//           }}
//         >
//           {/* {Array.from({ length: 7 * uiStore.tracker.daysInView }).map(
//             (_, index) => {
//               const currentDayStart = startOfDay(
//                 addDays(dateInView, index - daysInViewOffset),
//               );
//               const currentDayEnd = endOfDay(
//                 addDays(dateInView, index - daysInViewOffset),
//               );
//               return (
//                 <div
//                   // biome-ignore lint/suspicious/noArrayIndexKey: count won't change
//                   key={index}
//                   className="absolute top-0 isolate h-full"
//                   style={{
//                     width: `${dayWidth}%`,
//                     left: `${50 - dayWidth * daysInViewOffset + (index - dayOffsetToStartOfWeek) * dayWidth}%`,
//                   }}
//                 >
//                   <div className="relative h-full before:absolute before:h-full before:bg-muted before:w-px"> */}
//           {/* {convertedTimeEntries.map(
//                   ({ uuid, project, startedAt, stoppedAt, note }) => {
//                     if (
//                       (startedAt >= currentDayStart &&
//                         startedAt <= currentDayEnd) ||
//                       (stoppedAt >= currentDayStart &&
//                         stoppedAt <= currentDayEnd) ||
//                       (startedAt <= currentDayStart &&
//                         stoppedAt >= currentDayEnd)
//                     ) {
//                       const entryStart =
//                         startedAt < currentDayStart
//                           ? currentDayStart
//                           : startedAt;
//                       const entryEnd =
//                         stoppedAt > currentDayEnd ? currentDayEnd : stoppedAt;

//                       return (
//                         <TimeEntry
//                           key={uuid}
//                           projectName={project?.name}
//                           projectHexColor={project?.hexColor}
//                           uuid={uuid}
//                           startedAt={startedAt}
//                           stoppedAt={stoppedAt}
//                           note={note}
//                           style={{
//                             top: `${((entryStart.getHours() + entryStart.getMinutes() / 60) * 100) / 24}%`,
//                             height: `${Math.max(((entryEnd.getTime() - entryStart.getTime()) / (1000 * 60 * 60)) * (100 / 24), 1.04)}%`,
//                           }}
//                         />
//                       );
//                     }
//                     return null;
//                   },
//                 )} */}
//           {/* </div>
//                 </div>
//               );
//             },
//           )} */}
//         </div>
//       </div>
//     </div>
//   );
// });

// function Tracker() {
//   return (
//     <div className="flex w-full flex-col">
//       <TrackerHeader />
//       <div className="flex h-full w-full overflow-auto">
//         <div className="h-full w-full">
//           <TrackerCalendar />
//         </div>
//         {/* <AnimatePresence>
//           {selectedTimeEntryUuid && selectedTimeEntry && (
//             <motion.div
//               initial={{ width: 0 }}
//               transition={{
//                 ease: "linear",
//                 duration: 0.15,
//               }}
//               animate={{ width: 360 }}
//               exit={{ width: 0 }}
//             >
//               <div className="w-[360px] p-3 h-full border-l border-muted"></div>
//             </motion.div>
//           )}
//         </AnimatePresence> */}
//       </div>
//     </div>
//   );
// }

// export { Tracker };
