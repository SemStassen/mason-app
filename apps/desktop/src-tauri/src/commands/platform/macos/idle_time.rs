use objc2_core_graphics::{CGEventSource, CGEventSourceStateID, CGEventType};

pub fn get_idle_time_seconds() -> u32 {
    let secs = unsafe {
        CGEventSource::seconds_since_last_event_type(
            CGEventSourceStateID::CombinedSessionState,
            CGEventType::Null, // see note below
        )
    };
    if secs.is_finite() && secs >= 0.0 {
        secs as u32
    } else {
        0
    }
}
