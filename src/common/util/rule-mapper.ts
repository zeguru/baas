// src/rules/rule-mapper.ts
import { FriendlyRule, EngineRule, FriendlyEvent, EngineEvent } from './dsl-utils';


export class RuleMapper {

  
  static toEngineRule(friendly: FriendlyRule): EngineRule {
    return {
      conditions: friendly.when,
      event: {
        type: friendly.then.do,
        params: friendly.then.with,
      },
      priority: friendly.priority,
    };
  }


  // Events
  static toFriendlyEvent(engineEvent: EngineEvent): FriendlyEvent {
    return {
      do: engineEvent.type,
      with: engineEvent.params,
    };
  }

//   static toEngineEvent(friendlyEvent: FriendlyEvent): EngineEvent {
//     return {
//       type: friendlyEvent.do,
//       params: friendlyEvent.with,
//     };
//   }

  //Bulk
  static mapArrayToEngine(rules: FriendlyRule[]): EngineRule[] {
    return rules.map(this.toEngineRule);
  }

//   static mapArrayToFriendly(rules: EngineRule[]): FriendlyRule[] {
//     return rules.map(this.toFriendlyRule);
//   }

static mapEventsToFriendly(events: EngineEvent[]): FriendlyEvent[] {
    return events.map(this.toFriendlyEvent);
  }

  
}
