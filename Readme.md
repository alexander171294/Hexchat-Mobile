# Install gateway:

download go:

https://www.educative.io/edpresso/how-to-install-go-on-ubuntu

and clone:

https://github.com/kiwiirc/webircgateway

correr el gateway:
./webircgateway --config=config.conf

## build android

To fix capacitor notifications plugin you nedd to go refactor -> migrate to AndroidX

and change:

from:
import androidx.core.util.ArraySet;

to
import androidx.collection.ArraySet;

from:
import android.support.v4.media.app.NotificationCompat.MediaStyle;

to:
import androidx.media.app.NotificationCompat.MediaStyle;

Para correr solo angular:
ionic cap run android --prod

## releases:

in playstore: https://play.google.com/store/apps/details?id=com.tandilserver.hexchat