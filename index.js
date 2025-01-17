const express = require("express")
const mysql = require("mysql2")
const app = express()
app.use(express.json())

//add db connection

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'book_db',
    password: 'vihashah',
})

//sql query excecutor function
const query = (sql, values) => {
    return new Promise((resolve, reject) => {
        pool.execute(sql, values, (err, results) => {
            if (err) {
                return reject(err)
            }
            resolve(results)
        });
    });
};
//function that validates the books
const validate_book = (book) => {
    if (!book.title || typeof book.title !== "string") {
        return 'title is requried'
    }
    if (!book.author || typeof book.author !== "string") {
        return 'author name is requried'
    }
    if (!book.year || typeof book.year !== "number" || book.year < 0) {
        return 'publishing year  is requried'
    }
    return null
}
// adding new book 
app.post('/books', async (req, res) => {
    const { title, author, year } = req.body
    const validation_error = validate_book({ title, author, year })
    if (validation_error) {
        return res.status(400).json({ error: validation_error })
    }
    try {
        const sql = 'insert into books(title, author, year) values(?,?,?)'
        const result = await query(sql, [title, author, year])
        const new_book = { id: result.insertId, title, author, year }
        res.status(201).json(new_book)
    }
    catch (err) {
        res.status(500).json({ error: "failed adding the new book" })
    }

})

// for getting all books
app.get('/books', async (req, res) => {
    try {
        const sql = 'select * from books'
        const books = await query(sql)
        res.json(books)
    }
    catch (err) {
        res.status(500).json({ error: "failed to get all books" })
    }

})

//getting single book by id
app.get('/books/:id', async(req, res) => {
    const book_id = parseInt(req.params.id)


    try {
        const sql = 'select * from books where id = ? '
        const [book] = await query(sql, [book_id])
        if (!book) {
            return res.status(404).json({ error: "book not found properly" })

        }

        res.json(book)
    }
    catch (err) {
        res.status(500).json({ error: "failed to get the book" })
    }

})

//updating book by id
app.put('/books/:id', async(req, res) => {
    const book_id = parseInt(req.params.id)
    const { title, author, year } = req.body
    const validation_error = validate_book({ title, author, year })

    if (validation_error) {
        return res.status(400).json({ error: validation_error })
    }
    try {
        const sql = 'update books set title = ?, author = ?, year = ? where id = ?'
        await query(sql, [title, author, year, book_id])
        const updated_book = { id: book_id, title, author, year }
        res.json(updated_book)

    }
    catch (err) {
        res.status(500).json({ error: "failed to update the book" })
    }

})

// deleting book by id
app.delete('/books/:id', async(req, res) => {
    const book_id = parseInt(req.params.id)
    try {
        const sql = 'delete from books where id = ? '
        await query(sql, [book_id])
        res.status(204).send()

    }
    catch (err) {
        res.status(500).json({ error: "failed to delete the book" })
    }

})

const port = 3000
app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})