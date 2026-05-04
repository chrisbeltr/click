const Firestore = require('@google-cloud/firestore');

const db = new Firestore({
  projectId: 'cummy-bot',
  keyFilename: 'key.json',
});

async function get() {
	const snapshot = await db.collection('test').get();
	console.log("um");
	snapshot.forEach((doc) => {
	  console.log(doc.id, '=>', doc.data());
	});
}

setTimeout(get, 0);
