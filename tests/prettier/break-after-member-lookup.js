// Should stay on one line
object.property1.property2

// Should break at `.` operator and indent
object.looooooooooooooooooooooooooooooooooooooooooooooooooooooooong.looooooooooooooooooooooooooooooooooooooooooooooooooooooooong

// Should break at `.` operator when necessary
request.hello.world.function('foo').some.really.really.really.really.really.really.really.really.really.really.really.really.really.really.really.really.really.really.really.long.constant.post('/version').set('Prefer', 'plurality=singular').send()

// real code

function * sendMail () {
  try {
    const pdfStream = yield contractsService.getLandlordContractStreamFromBooking(booking)
  } catch (error) {
    report(error)
  }
}
