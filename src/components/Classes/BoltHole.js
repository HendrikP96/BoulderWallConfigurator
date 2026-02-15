Klasse BoltHole
// Klasse Bolthole ist dafür zuständig den eigenen Hold zu verwalten 


Attribute: 
BoltHole hat
- eine Position im Raum 
- SphereCollider // ein unsichtbares Collider Mesh in Form einer Sphere zum Überprüfen von Raycasts und zum snappen der Holds 

- Kann ein Hold haben 

Konstruktor: 
BoltHole(Vector3D pos):     // empty

Bolthole(Vector3D pos, Hold)    // mit Hold 

Methoden: 

- getHold
- setHold

- getPosition
- setPosition

- boolIsEmpty // prüft, ob bereits ein Hold angebracht ist 

- snapToBoltHole(Hold hold)   // Wenn RayCast ersten SphereCollider trifft und das Loch leer ist, dann wird Hold in BoltHole platziert. 
