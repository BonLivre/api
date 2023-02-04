import { hash } from 'argon2'
import { PrismaClient, Author, Book, Genre, Industry } from '@prisma/client'

import books from './data/books.json'
import people from './data/people.json'
import * as Minio from 'minio'
import { config } from 'dotenv'

config()

const prisma = new PrismaClient()

async function seed() {
  console.log('🌱 Seeding database...')

  await seedUsers()
  await seedImages()
  await seedAuthors()
  await seedGenres()
  const [books] = await seedBooks()
  await seedCelebrities(books as Book[])

  console.log('✅ Seeding complete!')
}
seed()

async function seedUsers() {
  const usersData = [
    {
      username: 'alicesmith',
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice.smith@example.com',
      password: await hash('password'),
    },
    {
      username: 'johndoe',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: await hash('password'),
    },
    {
      username: 'janejones',
      firstName: 'Jane',
      lastName: 'Jones',
      email: 'jane.jones@example.com',
      password: await hash('password'),
    },
  ]

  const users = await Promise.all(usersData.map((userData) => prisma.user.create({ data: userData })))

  return users
}

async function seedAuthors(): Promise<Author[]> {
  const authorsData = [
    { name: 'J. R. R. Tolkien' },
    { name: 'Mark Manson' },
    { name: 'Robert Greene' },
    { name: 'Robert C. Martin' },
    { name: 'Jordan Peterson' },
    { name: 'Fyodor Dostoevsky' },
    { name: 'Albert Camus' },
    { name: 'Charles Péguy' },
    { name: 'Alan A. A. Donovan' },
    { name: 'Brian W. Kernighan' },
    { name: 'Marguerite Yourcenar' },
    { name: 'Stendhal' },
    { name: 'Antoine de Saint-Exupéry' },
    { name: 'Honoré de Balzac' },
    { name: 'Victor Hugo' },
    { name: 'Jules Verne' },
    { name: 'J. K. Rowling' },
    { name: 'Nassim Nicholas Taleb' },
    { name: 'Alexandre Dumas' },
    { name: 'William Shakespeare' },
    { name: 'François Rabelais' },
    { name: 'François de La Rochefoucauld' },
    { name: 'Jean de La Fontaine' },
    { name: '50 Cent' },
    { name: 'J. D. Salinger' },
    { name: 'George Orwell' },
    { name: 'William Faulkner' },
    { name: 'Niccolò Machiavelli' },
    { name: 'John Steinbeck' },
    { name: 'Ernest Hemingway' },
  ]

  Object.keys(books).forEach((key) => {
    const book = books[key]
    authorsData.push(
      ...book.authors.map((authorName) => {
        return { name: authorName }
      }),
    )
  })

  const authors = await Promise.all(
    authorsData.map(async (data) => {
      try {
        return await prisma.author.create({ data })
      } catch {}
    }),
  )

  return authors
}

async function seedGenres(): Promise<Genre[]> {
  const genresData = [
    { name: 'psychologie' },
    { name: 'fiction' },
    { name: 'high-fantasy' },
    { name: 'epic' },
    { name: 'philosophie' },
    { name: 'roman' },
    { name: 'développement personnel' },
    { name: 'science' },
    { name: 'histoire' },
    { name: 'programmation' },
    { name: 'classique' },
    { name: 'poésie' },
    { name: 'business' },
    { name: 'biographie' },
    { name: 'thriller' },
    { name: 'science-fiction' },
    { name: 'fantasy' },
    { name: 'policier' },
    { name: 'essai' },
    { name: 'dystopie' },
    { name: 'aventure' },
  ]

  const genres = await Promise.all(genresData.map((data) => prisma.genre.create({ data })))

  return genres
}

interface BookData {
  title: string
  yearOfPublication: number
  language: string
  color: string
  authors: string[]
  genres: string[]
  description: string
}

const genres: Genre[] = []

async function seedBook(bookData: BookData): Promise<Book> {
  const authorsData = await Promise.all(
    bookData.authors.map(async (authorName) => {
      const author = await prisma.author.findUnique({ where: { name: authorName } })
      if (!author) {
        return prisma.author.create({ data: { name: authorName } })
      }
      return author
    }),
  )

  const genresData = await Promise.all(
    bookData.genres.map(async (genreName) => {
      let genre = genres.find((genre) => genre.name === genreName)
      if (!genre) {
        genre = await prisma.genre.create({ data: { name: genreName } })
      }
      genres.push(genre)
      return genre
    }),
  )

  try {
    return prisma.book.create({
      data: {
        title: bookData.title,
        yearOfPublication: bookData.yearOfPublication,
        language: bookData.language,
        color: 'indigo',
        authors: { connect: authorsData.map((author) => ({ id: author.id })) },
        genres: { connect: genresData.map((genre) => ({ id: genre.id })) },
        verified: true,
        description: bookData.description,
      },
    })
  } catch (error) {
    console.log('error', error)
    console.log(
      `⚠️ Error while seeding book ${bookData.title} (authors: ${bookData.authors.join(
        ', ',
      )}, genres: ${bookData.genres.join(', ')})`,
    )
  }
}

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: Number(process.env.MINIO_PORT),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ROOT_USER || process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_ROOT_PASSWORD || process.env.MINIO_SECRET_KEY,
})

async function createBucketIfNotExists(bucketName: string) {
  const bucketExists = await minioClient.bucketExists(bucketName)
  if (!bucketExists) {
    await minioClient.makeBucket(bucketName, 'eu-west-1')
  }
}

async function seedImages() {
  await createBucketIfNotExists('covers')
  await createBucketIfNotExists('celebrities')
}

async function seedBooks() {
  const booksData = [
    {
      title: 'The Subtle Art of Not Giving a Fuck',
      yearOfPublication: 2019,
      language: 'english',
      color: 'indigo',
      authors: ['Mark Manson'],
      genres: ['psychologie', 'développement personnel'],
      description:
        'In this generation-defining développement personnel guide, a superstar blogger cuts through the crap to show us how to stop trying to be positive all the time so that we can truly become better, happier people. \n' +
        '\n' +
        'For decades we\'ve been told that positive thinking is the key to a happy, rich life. "F*ck positivity," Mark Manson says. "Let\'s be honest, shit is f*cked, and we have to live with it." In his wildly popular Internet blog, Manson doesn\'t sugarcoat or equivocate. He tells it like it is - a dose of raw, refreshing, honest truth that is sorely lacking today. The Subtle Art of Not Giving a F*ck is his antidote to the coddling, let\'s-all-feel-good mind-set that has infected modern society and spoiled a generation, rewarding them with gold medals just for showing up. \n' +
        '\n' +
        'Manson makes the argument, backed by both academic research and well-timed poop jokes, that improving our lives hinges not on our ability to turn lemons into lemonade but on learning to stomach lemons better. Human beings are flawed and limited - "not everybody can be extraordinary; there are winners and losers in society, and some of it is not fair or your fault". Manson advises us to get to know our limitations and accept them. Once we embrace our fears, faults, and uncertainties, once we stop running and avoiding and start confronting painful truths, we can begin to find the courage, perseverance, honesty, responsibility, curiosity, and forgiveness we seek. \n' +
        '\n' +
        'There are only so many things we can give a f*ck about, so we need to figure out which ones really matter, Manson makes clear. While money is nice, caring about what you do with your life is better, because true wealth is about experience. A much-needed grab-you-by-the-shoulders-and-look-you-in-the-eye moment of real talk, filled with entertaining stories and profane, ruthless humor, The Subtle Art of Not Giving a F*ck is a refreshing slap for a generation to help them lead contented, grounded lives. \n' +
        '\n',
    },
    {
      title: 'The Go programming language',
      yearOfPublication: 2015,
      language: 'english',
      color: 'indigo',
      authors: ['Alan A. A. Donovan', 'Brian W. Kernighan'],
      genres: ['programmation'],
      description:
        'The authoritative resource to writing clear and idiomatic Go to solve real-world problems\n' +
        '\n' +
        'Google’s Go team member Alan A. A. Donovan and Brian Kernighan, co-author of The C Programming Language, provide hundreds of interesting and practical examples of well-written Go code to help programmers learn this flexible, and fast, language. It is designed to get you started programmation with Go right away and then to progress on to more advanced topics.\n' +
        '\n' +
        'Basic components: an opening tutorial provides information and examples to get you off the ground and doing useful things as quickly as possible. This includes:\n' +
        'command-line arguments\n' +
        'gifs\n' +
        'URLs\n' +
        'web servers\n' +
        'Program structure: simple examples cover the basic structural elements of a Go program without getting sidetracked by complicated algorithms or data structures.\n' +
        'Data types: Go offers a variety of ways to organize data, with a spectrum of data types that at one end match the features of the hardware and at the other end provide what programmers need to conveniently represent complicated data structures.\n' +
        'Composite types:\n' +
        'arrays\n' +
        'slices\n' +
        'maps\n' +
        'structs\n' +
        'JSON\n' +
        'test and HTML templates\n' +
        'Functions: break a big job into smaller pieces that might well be written by different people separated by both time and space.\n' +
        'Methods:\n' +
        'declarations\n' +
        'with a pointer receiver\n' +
        'struct embedding\n' +
        'values and expressions\n' +
        'Interfaces: write functions that are more flexible and adaptable because they are not tied to the details of one particular implementation.\n' +
        'Concurrent programmation: Goroutines, channels, and with shared variables.\n' +
        'Packages: use existing packages and create new ones.\n' +
        'Automated testing: write small programs that check the code.\n' +
        'Reflection features: update variables and inspect their values at run time.\n' +
        'Low-level programmation: step outside the usual rules to achieve the highest possible performance, interoperate with libraries written in other languages, or implement a function that cannot be expressed in pure Go.\n' +
        'Each chapter has exercises to test your understanding and explore extensions and alternatives. Source code is freely available for download and may be conveniently fetched, built, and installed using the go get command.\n' +
        '\n',
    },
    {
      title: "Mémoires d'Hadrien",
      yearOfPublication: 1951,
      language: 'french',
      color: 'indigo',
      authors: ['Marguerite Yourcenar'],
      genres: ['roman', 'histoire'],
      description:
        "\"J'ai formé le projet de te raconter ma vie.\" Sur son lit de mort, l'empereur romain Hadrien (117-138) adresse une lettre au jeune Marc Aurèle dans laquelle il commence par donner \"audience à ses souvenirs\". Très vite, le vagabondage d'esprit se structure, se met à suivre une chronologie, ainsi qu'une rigueur de pensée propre au grand personnage. Derrière l'esthète cultivé et fin stratège qu'était Hadrien, Marguerite Yourcenar aborde les thèmes qui lui sont chers : la mort, la dualité déroutante du corps et de l'esprit, le sacré, l'amour, l'art et le temps. À l'image de ce dernier, ce \"grand sculpteur\", elle taille, façonne, affine avec volupté chacun des traits intérieurs du grand homme à qui elle fait dire : \"Je compte sur cet examen des faits pour me définir, me juger peut-être ou tout au moins pour me mieux connaître avant de mourir.\"\n" +
        'Marguerite Yourcenar trouva un jour, dans la Correspondance de Flaubert, une phrase inoubliable :\n' +
        "« Les dieux n'étant plus, et le Christ n'étant pas encore, il y a eu, de Cicéron à Marc Aurèle, un moment unique où l'homme seul a été. »\n" +
        "Et l'auteur des Mémoires d'Hadrien ajoute :\n" +
        "« Une grande partie de ma vie allait se passer à essayer de définir, puis à peindre, cet homme seul et d'ailleurs relié à tout. »\n" +
        "Traduit dans seize langues, salué par la presse du monde entier, les Mémoires d'Hadrien n'ont jamais cessé, depuis leur publication en 1951, d'entraîner de nouveaux lecteurs vers cet Empereur du IIe siècle, cet « homme presque sage » qui fut, en même temps qu'un initiateur des temps nouveaux, l'un des derniers libres esprits de l'Antiquité.",
    },
    {
      title: 'Le Petit Prince',
      yearOfPublication: 1943,
      language: 'french',
      color: 'indigo',
      authors: ['Antoine de Saint-Exupéry'],
      genres: ['roman', 'histoire'],
      description: `Le Petit Prince est une œuvre de langue française, la plus connue d'Antoine de Saint-Exupéry. Publié en 1943 à New York simultanément à sa traduction anglaise, c'est une œuvre poétique et philosophique sous l'apparence d'un conte pour enfants.
      Traduit en quatre cent cinquante-sept langues et dialectes, Le Petit Prince est le deuxième ouvrage le plus traduit au monde après la Bible.
      Le langage, simple et dépouillé, parce qu'il est destiné à être compris par des enfants, est en réalité pour le narrateur le véhicule privilégié d'une conception symbolique de la vie. Chaque chapitre relate une rencontre du petit prince qui laisse celui-ci perplexe, par rapport aux comportements absurdes des « grandes personnes ». Ces différentes rencontres peuvent être lues comme une allégorie.
      Les aquarelles font partie du texte et participent à cette pureté du langage : dépouillement et profondeur sont les qualités maîtresses de l'œuvre.
      On peut y lire une invitation de l'auteur à retrouver l'enfant en soi, car « toutes les grandes personnes ont d'abord été des enfants. (Mais peu d'entre elles s'en souviennent.) ». L'ouvrage est dédié à Léon Werth, mais « quand il était petit garçon ».
      `,
    },
    {
      title: 'Le Seigneur des Anneaux',
      yearOfPublication: 1954,
      language: 'french',
      color: 'indigo',
      authors: ['J. R. R. Tolkien'],
      genres: ['roman', 'high-fantasy'],
      description: `Le Seigneur des anneaux est un roman de fantasy écrit par l'écrivain britannique J. R. R. Tolkien. Il est composé de trois volumes, Le Hobbit, La Communauté de l'anneau et Le Retour du roi. Le Seigneur des anneaux est le roman le plus vendu de l'histoire de la littérature, avec plus de 150 millions d'exemplaires vendus dans le monde. Il a été traduit en plus de 50 langues et a été adapté en plusieurs films, séries télévisées et jeux vidéo.`,
    },
    {
      title: "L'Étranger",
      yearOfPublication: 1942,
      language: 'french',
      color: 'indigo',
      authors: ['Albert Camus'],
      genres: ['roman', 'philosophie'],
      description: `L'Étranger est le premier roman publié d’Albert Camus, paru en 1942. Il prend place dans la tétralogie que Camus nommera « cycle de l’absurde » qui décrit les fondements de la philosophie camusienne : l’absurde. Le roman a été traduit en soixante-huit langues.`,
    },
    {
      title: 'Le Rouge et le Noir',
      yearOfPublication: 1830,
      language: 'french',
      color: 'indigo',
      authors: ['Stendhal'],
      genres: ['roman', 'classique'],
      description: `Le Rouge et le Noir est un roman de Stendhal publié en 1830. Il est considéré comme l'un des chefs-d'œuvre de la littérature française. Il a été traduit en plus de 50 langues et a été adapté en plusieurs films, séries télévisées et jeux vidéo.`,
    },
    {
      title: 'Le Père Goriot',
      yearOfPublication: 1835,
      language: 'french',
      color: 'indigo',
      authors: ['Honoré de Balzac'],
      genres: ['roman', 'classique'],
      description: `Le Père Goriot est un roman de Balzac publié en 1835. Il est considéré comme l'un des chefs-d'œuvre de la littérature française. Il a été traduit en plus de 50 langues et a été adapté en plusieurs films, séries télévisées et jeux vidéo.`,
    },
    {
      title: 'Les Misérables',
      yearOfPublication: 1862,
      language: 'french',
      color: 'indigo',
      authors: ['Victor Hugo'],
      genres: ['roman', 'classique'],
      description: `Les Misérables est un roman de Victor Hugo publié en 1862. Il est considéré comme l'un des chefs-d'œuvre de la littérature française. Il a été traduit en plus de 50 langues et a été adapté en plusieurs films, séries télévisées et jeux vidéo.`,
    },
    {
      title: 'Le Comte de Monte-Cristo',
      yearOfPublication: 1844,
      language: 'french',
      color: 'indigo',
      authors: ['Alexandre Dumas'],
      genres: ['roman', 'classique'],
      description: `Le Comte de Monte-Cristo est un roman d'Alexandre Dumas publié en 1844. Il est considéré comme l'un des chefs-d'œuvre de la littérature française. Il a été traduit en plus de 50 langues et a été adapté en plusieurs films, séries télévisées et jeux vidéo.`,
    },
    {
      title: 'Les Trois Mousquetaires',
      yearOfPublication: 1844,
      language: 'french',
      color: 'indigo',
      authors: ['Alexandre Dumas'],
      genres: ['roman', 'classique'],
      description: `Le Comte de Monte-Cristo est un roman d'Alexandre Dumas publié en 1844. Il est considéré comme l'un des chefs-d'œuvre de la littérature française. Il a été traduit en plus de 50 langues et a été adapté en plusieurs films, séries télévisées et jeux vidéo.`,
    },
    {
      title: 'Antifragile',
      yearOfPublication: 2012,
      language: 'english',
      color: 'indigo',
      authors: ['Nassim Nicholas Taleb'],
      genres: ['philosophie', 'business'],
      description: `Antifragile is a book by Nassim Nicholas Taleb, published in 2012. It is a follow-up to his 2007 book The Black Swan: The Impact of the Highly Improbable. Antifragile is a neologism coined by Taleb to describe...`,
    },
    {
      title: 'The Black Swan',
      yearOfPublication: 2007,
      language: 'english',
      color: 'indigo',
      authors: ['Nassim Nicholas Taleb'],
      genres: ['philosophie', 'business'],
      description: `The Black Swan is a book by Nassim Nicholas Taleb, published in 2007. It is a follow-up to his 2001 book Fooled by Randomness: The Hidden Role of Chance in Life and in the Markets. The Black Swan is a neologism coined by Taleb to describe...`,
    },
    {
      title: 'Fooled by Randomness',
      yearOfPublication: 2001,
      language: 'english',
      color: 'indigo',
      authors: ['Nassim Nicholas Taleb'],
      genres: ['philosophie', 'business'],
      description: `Fooled by Randomness is a book by Nassim Nicholas Taleb, published in 2001. It is a follow-up to his 1997 book The Black Swan: The Impact of the Highly Improbable. Fooled by Randomness is a neologism coined by Taleb to describe...`,
    },
    {
      title: 'The 48 Laws of Power',
      yearOfPublication: 1998,
      language: 'english',
      color: 'indigo',
      authors: ['Robert Greene'],
      genres: ['philosophie', 'business'],
      description: `The 48 Laws of Power is a book by Robert Greene, published in 1998. It is a follow-up to his 1995 book The 33 Strategies of War. The 48 Laws of Power is a neologism coined by Greene to describe...`,
    },
    {
      title: 'The 33 Strategies of War',
      yearOfPublication: 1995,
      language: 'english',
      color: 'indigo',
      authors: ['Robert Greene'],
      genres: ['philosophie', 'business'],
      description: `The 33 Strategies of War is a book by Robert Greene, published in 1995. It is a follow-up to his 1991 book The 48 Laws of Power. The 33 Strategies of War is a neologism coined by Greene to describe...`,
    },
    {
      title: 'The Laws of Human Nature',
      yearOfPublication: 1990,
      language: 'english',
      color: 'indigo',
      authors: ['Robert Greene'],
      genres: ['philosophie', 'business'],
      description: `The Laws of Human Nature is a book by Robert Greene, published in 1990. It is a follow-up to his 1988 book The 33 Strategies of War. The Laws of Human Nature is a neologism coined by Greene to describe...`,
    },
    {
      title: 'The 50th Law',
      yearOfPublication: 2009,
      language: 'english',
      color: 'indigo',
      authors: ['50 Cent', 'Robert Greene'],
      genres: ['philosophie', 'business'],
      description: `The 50th Law is a book by 50 Cent and Robert Greene, published in 2009. It is a follow-up to his 2008 book The 48 Laws of Power. The 50th Law is a neologism coined by Greene to describe...`,
    },
    {
      title: '1984',
      yearOfPublication: 1949,
      language: 'english',
      color: 'indigo',
      authors: ['George Orwell'],
      genres: ['roman', 'classique', 'dystopie'],
      description: `1984 is a book by George Orwell, published in 1949. It is a follow-up to his 1948 book Animal Farm. 1984 is a neologism coined by Orwell to describe...`,
    },
    {
      title: 'Animal Farm',
      yearOfPublication: 1948,
      language: 'english',
      color: 'indigo',
      authors: ['George Orwell'],
      genres: ['roman', 'classique'],
      description: `Animal Farm is a book by George Orwell, published in 1948. It is a follow-up to his 1945 book 1984. Animal Farm is a neologism coined by Orwell to describe...`,
    },
    {
      title: 'The Prince',
      yearOfPublication: 1532,
      language: 'italian',
      color: 'indigo',
      authors: ['Niccolò Machiavelli'],
      genres: ['roman', 'classique'],
      description: `The Prince is a book by Niccolò Machiavelli, published in 1532. It is a follow-up to his 1513 book The Discourses. The Prince is a neologism coined by Machiavelli to describe...`,
    },
    {
      title: 'The Discourses',
      yearOfPublication: 1513,
      language: 'italian',
      color: 'indigo',
      authors: ['Niccolò Machiavelli'],
      genres: ['roman', 'classique'],
      description: `The Discourses is a book by Niccolò Machiavelli, published in 1513. It is a follow-up to his 1505 book The Prince. The Discourses is a neologism coined by Machiavelli to describe...`,
    },
    {
      title: 'Le Prince',
      yearOfPublication: 1532,
      language: 'french',

      color: 'indigo',
      authors: ['Niccolò Machiavelli'],
      genres: ['roman', 'classique'],
      description: `Le Prince is a book by Niccolò Machiavelli, published in 1532. It is a follow-up to his 1513 book Les Discours. Le Prince is a neologism coined by Machiavelli to describe...`,
    },
    {
      title: 'Le Vieil Homme et la Mer',
      yearOfPublication: 1952,
      language: 'french',
      color: 'indigo',
      authors: ['Ernest Hemingway'],
      genres: ['roman', 'classique'],
      description: `Le Vieil Homme et la Mer is a book by Ernest Hemingway, published in 1952. It is a follow-up to his 1950 book Le Soleil se lève aussi. Le Vieil Homme et la Mer is a neologism coined by Hemingway to describe...`,
    },
    {
      title: 'Le Soleil se lève aussi',
      yearOfPublication: 1950,
      language: 'french',
      color: 'indigo',
      authors: ['Ernest Hemingway'],
      genres: ['roman', 'classique'],
      description: `Le Soleil se lève aussi is a book by Ernest Hemingway, published in 1950. It is a follow-up to his 1949 book Le Vieil Homme et la Mer. Le Soleil se lève aussi is a neologism coined by Hemingway to describe...`,
    },
  ]

  for await (const bookSlug of Object.keys(books)) {
    booksData.push({
      title: books[bookSlug].title,
      yearOfPublication: Math.floor(Math.random() * new Date().getFullYear()),
      authors: books[bookSlug].authors,
      genres: books[bookSlug].genres,
      description: books[bookSlug].description,
      color: 'indigo',
      language: 'english',
    })
  }

  const booksResult = await Promise.all(booksData.map((data) => seedBook(data)))

  return [booksResult, Object.keys(books)]
}

async function seedIndustries(industries: string[], occupations: string[]): Promise<Industry[]> {
  if (industries.length !== occupations.length) {
    throw new Error('industries and occupations must have the same length')
  }

  const industriesData: { name: string; job: string }[] = []
  for (let i = 0; i < industries.length; i++) {
    industriesData.push({ name: industries[i], job: occupations[i] })
  }

  const result: Industry[] = []

  for (const data of industriesData) {
    let industry = await prisma.industry.findUnique({
      where: {
        name: data.name,
      },
    })
    if (!industry) {
      industry = await prisma.industry.create({
        data: {
          name: data.name,
          job: data.job,
        },
      })
    }
    result.push(industry)
  }

  return result
}

async function seedCelebrities(books: Book[]) {
  for (const person of people) {
    const industries = await seedIndustries(person.industries, person.occupations)

    const recommendedBooks = books
      .filter((book) => book !== undefined)
      .map((book) => ({ id: book.id }))
      .sort(() => Math.random() - 0.5)
      .slice(0, 10)

    try {
      await prisma.celebrity.create({
        data: {
          name: person.name,
          industries: {
            connect: industries.map((industry) => ({ id: industry.id })),
          },
          recommendedBooks: { connect: recommendedBooks },
        },
      })
    } catch (error) {}
  }
}
