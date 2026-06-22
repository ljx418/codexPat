# V30.1 Action Storyboard Evidence - 2026-06-17

status: passed

## Coverage

storyboardCount: 8

### idle

- semanticGoal: Calm living idle with subtle breathing, blink, ear or tail life.
- keyPoses: neutral sit -> small breath lift -> blink or tail settle
- timing: slow loop, low amplitude
- loopType: loop
- reject transform-only: true
- visual review question: Can this read as a living pet without drifting around?

### thinking

- semanticGoal: Curious thinking: head turns, paw or chin gesture, eyes focused aside.
- keyPoses: look aside -> paw/chin emphasis -> return to thinking pose
- timing: medium loop with asymmetric head/paw pose
- loopType: loop
- reject transform-only: true
- visual review question: Can I tell the cat is thinking without the label?

### running

- semanticGoal: Clear locomotion or forward-energy run with body lean and stride rhythm.
- keyPoses: anticipation crouch -> forward stride -> airborne/extension -> recovery stride
- timing: fast loop, high amplitude
- loopType: loop
- reject transform-only: true
- visual review question: Does this look like running rather than sliding?

### success

- semanticGoal: Celebration with anticipation, jump or raised paws, and recovery.
- keyPoses: pre-jump crouch -> celebration extension -> happy landing/recover
- timing: short transient with strong peak pose
- loopType: transient
- reject transform-only: true
- visual review question: Does the cat visibly celebrate?

### warning

- semanticGoal: Alert posture with ears/eyes/body attention and cautious movement.
- keyPoses: alert ears -> look/check -> cautious hold
- timing: medium loop, controlled tension
- loopType: transient
- reject transform-only: true
- visual review question: Does it read as alert or warning rather than random shake?

### error

- semanticGoal: Failure/confusion: collapse, imbalance, dizzy or visibly uncomfortable pose.
- keyPoses: lose balance -> dizzy/collapse -> recover or hold failed state
- timing: transient with clear failure pose
- loopType: transient
- reject transform-only: true
- visual review question: Is this clearly different from warning and idle?

### need_input

- semanticGoal: The cat asks the user: look toward viewer, paw raise, waiting posture.
- keyPoses: look at user -> raise paw or lean forward -> hold waiting pose
- timing: medium loop, user-facing attention
- loopType: transient
- reject transform-only: true
- visual review question: Does this communicate 'I need you' without a symbol?

### sleeping

- semanticGoal: Resting sleep: lying or curled posture with calm breathing.
- keyPoses: lie/curl down -> closed eyes -> soft breath
- timing: slow loop, low amplitude
- loopType: loop
- reject transform-only: true
- visual review question: Does this read as sleep rather than sitting lower?

## Result

reasonCodes: none
